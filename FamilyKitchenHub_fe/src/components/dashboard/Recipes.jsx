import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/Recipes.css";
import bgRecipes from "../../assets/recipebg.jpg";
import RecipesBook from "../../assets/recipe-book.png";
import bgFooter from "../../assets/bgfooter.png";
import {
  Heart,
  HeartOff,
  Trash2,
  PlusCircle,
  X,
  Search,
  Filter,
  Pen,
  ChevronDown,
  ChefHat,
} from "lucide-react";
import ConfirmModal from "../ConfirmModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RecipeDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // =========================
  //  FORM DEFAULT – LUÔN ĐỒNG BỘ
  // =========================
  const defaultForm = {
    title: "",
    instructions: "",
    cookingTimeMinutes: "",
    servings: "",
    mealType: "",
    imageUrl: "",
    ingredients: [],
    categoryIds: [],
  };

  const [recipes, setRecipes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    itemId: null,
    itemTitle: ''
  });
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [search, setSearch] = useState(""); // Recipe search
  const [searchResults, setSearchResults] = useState([]); // Recipe search results
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Ingredient search states for each ingredient row
  const [ingredientSearches, setIngredientSearches] = useState({}); // { index: keyword }
  const [ingredientDropdowns, setIngredientDropdowns] = useState({}); // { index: boolean }
  const [ingredientSearching, setIngredientSearching] = useState({}); // { index: boolean }
  const searchTimeoutsRef = useRef({}); // { index: timeoutId }

  // =========================
  //   LOAD INGREDIENTS (1 LẦN)
  // =========================
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await axios.get("/ingredients");
        setAllIngredients(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(" Lỗi khi tải ingredients:", err);
      }
    };

    fetchIngredients();

    // Fetch Categories
    axios
      .get("/categories")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // =========================
  //   SEARCH INGREDIENTS WITH DEBOUNCE
  // =========================
  const handleIngredientSearch = (index, keyword) => {
    // Update search keyword
    setIngredientSearches((prev) => ({ ...prev, [index]: keyword }));
    setIngredientDropdowns((prev) => ({ ...prev, [index]: true }));

    // Clear previous timeout
    if (searchTimeoutsRef.current[index]) {
      clearTimeout(searchTimeoutsRef.current[index]);
    }

    // If empty, load all ingredients
    if (!keyword.trim()) {
      const loadAll = async () => {
        try {
          const res = await axios.get("/ingredients");
          setAllIngredients(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error loading ingredients:", err);
        }
      };
      loadAll();
      return;
    }

    // Set debounce timeout
    searchTimeoutsRef.current[index] = setTimeout(async () => {
      try {
        setIngredientSearching((prev) => ({ ...prev, [index]: true }));
        const res = await axios.get("/ingredients/search", {
          params: { keyword: keyword.trim() },
        });
        setAllIngredients(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error searching ingredients:", err);
      } finally {
        setIngredientSearching((prev) => ({ ...prev, [index]: false }));
      }
    }, 300);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.ingredient-search-container')) {
        setIngredientDropdowns({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // =========================
  //   LOAD RECIPES
  // =========================
  // =========================
  //   LOAD RECIPES
  // =========================
  useEffect(() => {
    // If searching text not empty, skip category fetch to avoid conflict
    if (search.trim()) return;

    const fetchRecipes = async () => {
      try {
        let url = "/recipes";
        if (selectedCategory) {
          url = `/categories/${selectedCategory}/recipes`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
        setSearchResults(res.data); //  INIT SEARCH RESULTS
      } catch (err) {
        console.error("Lỗi khi tải recipes:", err);
      }
    };
    fetchRecipes();
  }, [token, selectedCategory]);

  const handleCategoryClick = (id) => {
    setSelectedCategory((prev) => (prev === id ? null : id));
    setSearch(""); // Reset search text when choosing category
  };

  // =========================
  //   SEARCH RECIPES
  // =========================
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim()) {
      setSelectedCategory(null);
    } else {
      setSearchResults(recipes);
      return;
    }

    try {
      const res = await axios.get(`/recipes/search`, {
        params: { name: query },
      });
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(" Lỗi khi tìm kiếm recipes:", err);
      setSearchResults([]);
    }
  };

  // =========================
  //   MODAL OPEN/CLOSE
  // =========================
  const openModal = () => {
    setForm(defaultForm);
    setPreview(null);
    setIsOpen(true);
    // Reset ingredient search states
    setIngredientSearches({});
    setIngredientDropdowns({});
    setIngredientSearching({});
    setEditingId(null);
    setShowCategoryDropdown(false);
  };

  const closeModal = () => setIsOpen(false);

  // =========================
  //   HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "cookingTimeMinutes" || name === "servings") && Number(value) < 0) {
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "imageUrl") {
      setPreview(value || null);
    }
  };

  // =========================
  //   ADD RECIPE
  // =========================
  // =========================
  //   HANDLE CATEGORY TOGGLE
  // =========================
  const handleCategoryToggle = (id) => {
    setForm((prev) => {
      const current = prev.categoryIds || [];
      if (current.includes(id)) {
        return { ...prev, categoryIds: current.filter((x) => x !== id) };
      } else {
        return { ...prev, categoryIds: [...current, id] };
      }
    });
  };

  // =========================
  //   HANDLE EDIT CLICK
  // =========================
  const handleEditClick = async (recipe) => {
    setEditingId(recipe.id);
    setForm({
      title: recipe.title,
      instructions: recipe.instructions,
      cookingTimeMinutes: recipe.cookingTimeMinutes || "",
      servings: recipe.servings || "",
      mealType: recipe.mealType || "",
      imageUrl: recipe.imageUrl || "",
      ingredients: recipe.ingredients || [], // Might need mapping if structure differs
      categoryIds: [], // Will fetch below
    });
    setPreview(recipe.imageUrl);
    setIsOpen(true);

    try {
      // Fetch categories for this recipe
      const res = await axios.get(`/recipes/${recipe.id}/categories`);
      const catIds = res.data.map((c) => c.id);
      setForm((prev) => ({ ...prev, categoryIds: catIds }));
    } catch (err) {
      console.error("Error fetching recipe categories:", err);
    }
  };

  // =========================
  //   SUBMIT (ADD / UPDATE)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Missing auth token");

    try {
      const payload = {
        title: form.title,
        instructions: form.instructions,
        cookingTimeMinutes: form.cookingTimeMinutes
          ? Number(form.cookingTimeMinutes)
          : undefined,
        servings: form.servings ? Number(form.servings) : undefined,
        mealType: form.mealType || null,
        imageUrl: form.imageUrl || null,
        ingredients: form.ingredients.map((i) => ({
          ingredientId: Number(i.ingredientId),
          quantity: Number(i.quantity) || 0,
          unit: i.unit || "phần",
        })),
      };

      let savedRecipe;

      if (editingId) {
        // UPDATE
        const res = await axios.put(`/recipes/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        savedRecipe = res.data;

        // Update Categories
        await axios.post(
          `/recipes/${editingId}/categories`,
          { categoryIds: form.categoryIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecipes((prev) =>
          prev.map((r) => (r.id === editingId ? savedRecipe : r))
        );
        setSearchResults((prev) =>
          prev.map((r) => (r.id === editingId ? savedRecipe : r))
        );
        toast.success("Cập nhật công thức thành công!");
      } else {
        // CREATE
        const res = await axios.post("/recipes", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        savedRecipe = res.data;

        // Set Categories
        if (form.categoryIds.length > 0) {
          await axios.post(
            `/recipes/${savedRecipe.id}/categories`,
            { categoryIds: form.categoryIds },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        setRecipes((prev) => [savedRecipe, ...prev]);
        setSearchResults((prev) => [savedRecipe, ...prev]);
        toast.success("Thêm công thức thành công!");
      }

      closeModal();
    } catch (err) {
      console.error("Lỗi khi lưu recipe:", err);
      toast.error("Không thể lưu công thức.");
    }
  };

  // =========================
  //   DELETE RECIPE
  // =========================
  const handleDeleteClick = (recipe) => {

    setConfirmModal({
      isOpen: true,
      itemId: recipe.id,
      itemTitle: recipe.title
    });
  };

  const executeDelete = async () => {
    const id = confirmModal.itemId;
    console.log("Executing delete for ID:", id);
    if (!id) {
      console.error("No ID found for delete");
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calling API delete:", `/recipes/${id}`);
      await axios.delete(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTimeout(() => {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        setSearchResults((prev) => prev.filter((r) => r.id !== id));
        setIsLoading(false);
        setConfirmModal({ isOpen: false, itemId: null, itemTitle: '' });
        toast.success("Xóa công thức thành công!", { autoClose: 2000 });
      }, 2000);
    } catch (err) {
      setTimeout(() => {
        console.error("Lỗi khi xóa recipe:", err);
        setIsLoading(false);
        toast.error("Không thể xóa công thức.", { autoClose: 2000 });
        setConfirmModal({ isOpen: false, itemId: null, itemTitle: '' });
      }, 2000);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/manage/recipes/${id}`);
  };

  return (
    <div className="recipe-dashboard">
      <ToastContainer />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Xóa công thức"
        message={`Bạn có chắc muốn xóa công thức "${confirmModal.itemTitle}"?`}
        isLoading={isLoading}
      />
      {/* HEADER */}
      <header className="recipe-header">
        {/* Welcome Section */}
        <div className="welcome-section_recipe">
          <div className="welcome-recipe-text">
            <h1>Make a recipe just for you</h1>
          </div>
        </div>
      </header>


      {/* SEARCH SECTION */}
      <div className="search-recipes">
        <Search size={18} className="ai-search-icon" />
        <input
          type="text"
          className="search-recipe-input"
          placeholder="Search recipe..."
          value={search}
          onChange={handleSearch} //  CALL SEARCH API
        />
        <button className="add-btn-recipe" onClick={openModal}>
          <PlusCircle size={16} /> Add Recipe
        </button>
      </div>

      <div className="recipe-filter-step">
        <button className="filter-step-btn">
          <Filter size={16} /> Bộ lọc
        </button>
      </div>

      {/* Category Chips */}
      <div className="category-filters">
        <button
          className={`category-chip ${selectedCategory === null ? "active" : ""}`}
          onClick={() => handleCategoryClick(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip ${selectedCategory === cat.id ? "active" : ""
              }`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="recipes-heading">
        <h2 className="all-recipes">All Recipes</h2>
      </div>
      <div className="recipe-grid">
        {searchResults.length === 0 ? (
          <div className="empty">
            {search ? "No recipes found." : "No recipes yet. Create one!"}
          </div>
        ) : (
          searchResults.map((r, index) => (
            <div
              key={r.id}
              className="recipe-card"
              onClick={() => handleCardClick(r.id)}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* IMAGE */}
              <div className="card-image-side">
                <img
                  src={r.imageUrl || "/placeholder-recipe.jpg"}
                  alt={r.title}
                />
              </div>
              <div className="line-middle">
                <ChefHat size={16} />
              </div>
              {/* CONTENT */}
              <div className="card-content-side">
                <div className="card-header">
                  <div className="card-title">
                    <h3>{r.title}</h3>
                  </div>

                  <div className="card-actions">
                    <HeartOff size={18} />
                    <Pen
                      color="gray"
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(r);
                      }}
                    />

                    {/* <Trash2
                      color="gray"
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(r);
                      }}
                    /> */}
                  </div>
                </div>
                <div className="card-meta">
                  <span>⏱ {r.cookingTimeMinutes} min</span>
                  {r.servings && <span>{r.servings} servings</span>}
                  {r.mealType && <span>{r.mealType}</span>}
                </div>
                <p className="card-desc">{r.instructions}</p>

                <button
                  className="btn-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(r.id);
                  }}
                >
                  + Đặt
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* =============================
            MODAL ADD RECIPE
      ============================== */}
      {isOpen && (
        <div className={`fh-modal-overlay ${isOpen ? "fh-active" : ""}`}>
          <div
            className="fh-modal"
            style={{
              backgroundImage: `url(${bgFooter})`,
              backgroundPosition: "bottom",
              backgroundRepeat: "no-repeat",
              backgroundSize: "100% auto",
            }}
          >
            <div className="fh-modal-header">
              <img className="fh-recipesBook" src={RecipesBook} alt="" />
              <h3 className="fh-modal-title">
                {editingId ? "Edit Recipe" : "Add Recipe"}
              </h3>
            </div>
            <form className="fh-modal-form" onSubmit={handleSubmit}>
              <label className="fh-recipe-label">
                Title
                <input
                  placeholder=""
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className="fh-recipe-input"
                />
              </label>

              <label className="fh-recipe-label">
                Instructions
                <textarea
                  placeholder=""
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  required
                  className="fh-recipe-textarea"
                />
              </label>

              <div className="fh-recipe-form-grid">
                <label className="fh-recipe-label">
                  Time (minutes)
                  <input
                    placeholder="30 minutes"
                    type="number"
                    min="0"
                    name="cookingTimeMinutes"
                    value={form.cookingTimeMinutes}
                    onChange={handleChange}
                    className="fh-recipe-input"
                  />
                </label>

                <label className="fh-recipe-label">
                  Servings
                  <input
                    type="number"
                    min="0"
                    name="servings"
                    value={form.servings}
                    onChange={handleChange}
                    className="fh-recipe-input"
                  />
                </label>
              </div>

              <label className="fh-recipe-label">
                Meal Type
                <select
                  name="mealType"
                  value={form.mealType}
                  onChange={handleChange}
                  className="fh-recipe-input"
                >
                  <option value="">-- Select Meal Type --</option>
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                </select>
              </label>

              <label className="fh-recipe-label">
                Categories
                <div className="custom-combobox">
                  <div
                    className="combobox-trigger"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    {form.categoryIds && form.categoryIds.length > 0
                      ? `Selected ${form.categoryIds.length} categories`
                      : "-- Select Categories --"}
                    <ChevronDown size={16} />
                  </div>
                  {showCategoryDropdown && (
                    <div className="combobox-options">
                      {categories.map((cat) => (
                        <label key={cat.id} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={form.categoryIds?.includes(cat.id)}
                            onChange={() => handleCategoryToggle(cat.id)}
                          />
                          {cat.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </label>

              <label className="fh-recipe-label">
                Image URL
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="fh-recipe-input"
                />
              </label>

              {preview && (
                <div className="fh-recipe-image-preview">
                  <img
                    src={preview}
                    alt="Preview"
                    className="fh-recipe-image"
                  />
                </div>
              )}

              {/* INGREDIENTS */}
              <div className="fh-ingredients-section">
                <div className="fh-ingredients-header">
                  <h4 className="fh-ingredients-title">Ingredients</h4>

                  <button
                    type="button"
                    className="fh-add-ingredient-btn"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        ingredients: [
                          ...prev.ingredients,
                          { ingredientId: "", quantity: "", unit: "" },
                        ],
                      }))
                    }
                  >
                    + Add Ingredient
                  </button>
                </div>

                {form.ingredients.map((ing, index) => {
                  const searchKeyword = ingredientSearches[index] || "";
                  const showDropdown = ingredientDropdowns[index] || false;
                  const isSearching = ingredientSearching[index] || false;
                  const selectedIngredient = allIngredients.find(
                    (opt) => opt.id === Number(ing.ingredientId)
                  );

                  return (
                    <div key={index} className="fh-ingredient-row">
                      <div className="ingredient-search-container" style={{ position: "relative", flex: 1 }}>
                        <input
                          type="text"
                          placeholder={selectedIngredient ? selectedIngredient.name : ""}
                          value={searchKeyword || selectedIngredient?.name}
                          onChange={(e) => handleIngredientSearch(index, e.target.value)}
                          onClick={() => setIngredientDropdowns((prev) => ({ ...prev, [index]: true }))}
                          onFocus={() => setIngredientDropdowns((prev) => ({ ...prev, [index]: true }))}
                          className="fh-recipe-input fh-small"
                          required
                          style={{ width: "100%" }}
                        />
                        {isSearching && (
                          <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "12px", color: "#666" }}>
                            Đang tìm...
                          </span>
                        )}
                        {showDropdown && allIngredients.length > 0 && (
                          <div className="fh-dropdown">
                            {allIngredients.map((opt) => (
                              <div
                                key={opt.id}
                                className="fh-dropdown-item"
                                onClick={() => {
                                  const newList = [...form.ingredients];
                                  newList[index] = {
                                    ingredientId: opt.id,
                                    quantity: newList[index].quantity || "",
                                    unit: opt.unit || "",
                                  };
                                  setForm((prev) => ({
                                    ...prev,
                                    ingredients: newList,
                                  }));
                                  setIngredientSearches((prev) => ({
                                    ...prev,
                                    [index]: `${opt.name} (${opt.unit})`,
                                  }));
                                  setIngredientDropdowns((prev) => ({
                                    ...prev,
                                    [index]: false,
                                  }));
                                }}
                              >
                                {opt.name} <span>{opt.unit}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {selectedIngredient && (
                        <input
                          type="text"
                          placeholder="Unit"
                          value={selectedIngredient.unit || ""}
                          readOnly
                          className="fh-recipe-input fh-small"
                          style={{
                            backgroundColor: "#f5f5f5",
                            cursor: "not-allowed",
                            color: "#666",
                            width: "100px",
                          }}
                        />
                      )}

                      <input
                        type="number"
                        placeholder="Quantity"
                        value={ing.quantity}
                        onChange={(e) => {
                          const newList = [...form.ingredients];
                          newList[index].quantity = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            ingredients: newList,
                          }));
                        }}
                        className="fh-recipe-input fh-small"
                        required
                        style={{ width: "100px" }}
                      />

                      <button
                        type="button"
                        className="fh-remove-ingredient-btn"
                        onClick={() => {
                          const newList = form.ingredients.filter(
                            (_, i) => i !== index
                          );
                          setForm((prev) => ({
                            ...prev,
                            ingredients: newList,
                          }));
                          // Clean up search states
                          setIngredientSearches((prev) => {
                            const next = { ...prev };
                            delete next[index];
                            return next;
                          });
                          setIngredientDropdowns((prev) => {
                            const next = { ...prev };
                            delete next[index];
                            return next;
                          });
                          if (searchTimeoutsRef.current[index]) {
                            clearTimeout(searchTimeoutsRef.current[index]);
                            delete searchTimeoutsRef.current[index];
                          }
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="fh-modal-actions">
                <button
                  type="button"
                  className="fh-recipe-btn fh-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="fh-recipe-btn fh-primary">
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )
      }
    </div >
  );
}
