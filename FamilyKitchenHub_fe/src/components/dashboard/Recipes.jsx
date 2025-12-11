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
  ChefHat,
  Search,
  Filter,
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
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await axios.get("/recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
        setSearchResults(res.data); //  INIT SEARCH RESULTS
      } catch (err) {
        console.error("Lỗi khi tải recipes:", err);
      }
    };
    fetchRecipes();
  }, [token]);

  // =========================
  //   SEARCH RECIPES
  // =========================
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (!query.trim()) {
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
  };

  const closeModal = () => setIsOpen(false);

  // =========================
  //   HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "imageUrl") {
      setPreview(value || null);
    }
  };

  // =========================
  //   ADD RECIPE
  // =========================
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing auth token");

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

      const res = await axios.post("/recipes", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setRecipes((prev) => [res.data, ...prev]);
      setSearchResults((prev) => [res.data, ...prev]); // UPDATE SEARCH RESULTS

      setForm(defaultForm);
      setPreview(null);
      closeModal();

      alert("Thêm công thức thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm recipe:", err.response || err);
      alert(err.response?.data?.message || "Không thể thêm công thức.");
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
    if (!id) return;

    setIsLoading(true);
    try {
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
      <div className="recipes-heading">
        <h2 className="all-recipes">All Recipes</h2>
      </div>
      <div className="recipe-grid">
        {searchResults.length === 0 ? (
          <div className="empty">
            {search ? "No recipes found." : "No recipes yet. Create one!"}
          </div>
        ) : (
          searchResults.map((r) => (
            <div
              key={r.id}
              className="recipe-card"
              onClick={() => handleCardClick(r.id)}
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
                    {r.favorite ? (
                      <Heart color="red" size={18} />
                    ) : (
                      <HeartOff size={18} />
                    )}

                    <Trash2
                      color="gray"
                      size={18}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(r);
                      }}
                    />
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
              <h3 className="fh-modal-title">Add Recipe</h3>
            </div>
            <form className="fh-modal-form" onSubmit={handleAdd}>
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
                          placeholder="Tìm kiếm nguyên liệu..."
                          value={searchKeyword}
                          onChange={(e) => handleIngredientSearch(index, e.target.value)}
                          onFocus={() => {
                            if (allIngredients.length > 0) {
                              setIngredientDropdowns((prev) => ({ ...prev, [index]: true }));
                            }
                          }}
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
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              backgroundColor: "white",
                              border: "1px solid #ddd",
                              borderRadius: "4px",
                              maxHeight: "150px",
                              overflowY: "auto",
                              zIndex: 1000,
                              marginTop: "4px",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            }}
                          >
                            {allIngredients.map((opt) => (
                              <div
                                key={opt.id}
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
                                style={{
                                  padding: "6px 10px",
                                  cursor: "pointer",
                                  borderBottom: "1px solid #eee",
                                  fontSize: "13px",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = "#f5f5f5";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = "white";
                                }}
                              >
                                {opt.name} ({opt.unit})
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
      )}
    </div>
  );
}
