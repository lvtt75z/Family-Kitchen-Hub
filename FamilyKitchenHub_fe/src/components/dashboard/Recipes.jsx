import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/Recipes.css";
import bgRecipes from "../../assets/recipebg.jpg";
import RecipesBook from "../../assets/recipe-book.png";
import bgFooter from "../../assets/bgfooter.png";
import blobs from "../../assets/blob-scene-haikei.svg";
import {
  Heart,
  HeartOff,
  Trash2,
  PlusCircle,
  X,
  ChefHat,
  Search,
} from "lucide-react";

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
    imageUrl: "",
    ingredients: [],
  };

  const [recipes, setRecipes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState(null);
  const [allIngredients, setAllIngredients] = useState([]);
  const [search, setSearch] = useState(""); //  ADD SEARCH STATE
  const [searchResults, setSearchResults] = useState([]); //  SEARCH RESULTS

  // =========================
  //   LOAD INGREDIENTS (1 LẦN)
  // =========================
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/ingredients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllIngredients(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải ingredients:", err);
      }
    };

    if (allIngredients.length === 0) {
      fetchIngredients();
    }
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
      const res = await axios.get(
        `http://localhost:8080/api/recipes/search?name=${encodeURIComponent(
          query
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa công thức này?")) return;

    try {
      await axios.delete(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRecipes((prev) => prev.filter((r) => r.id !== id));
      setSearchResults((prev) => prev.filter((r) => r.id !== id)); // ✅ UPDATE SEARCH RESULTS
    } catch (err) {
      console.error(" Lỗi khi xóa recipe:", err);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/manage/recipes/${id}`);
  };

  return (
    <div className="recipe-dashboard">
      {/* HEADER */}
      <header className="recipe-header">
        {/* Welcome Section */}
        <div
          className="welcome-section_recipe"
          style={{
            backgroundImage: `url(${bgRecipes})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "110vh",
          }}
        >
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
                        handleDelete(r.id);
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

                {form.ingredients.map((ing, index) => (
                  <div key={index} className="fh-ingredient-row">
                    <select
                      value={ing.ingredientId}
                      onChange={(e) => {
                        const newList = [...form.ingredients];
                        newList[index].ingredientId = e.target.value;

                        setForm((prev) => ({
                          ...prev,
                          ingredients: newList,
                        }));
                      }}
                      className="fh-recipe-input fh-small"
                      required
                    >
                      <option value="">-- Select ingredient --</option>
                      {allIngredients.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>

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
                    />

                    <input
                      type="text"
                      placeholder="Unit"
                      value={ing.unit}
                      onChange={(e) => {
                        const newList = [...form.ingredients];
                        newList[index].unit = e.target.value;

                        setForm((prev) => ({
                          ...prev,
                          ingredients: newList,
                        }));
                      }}
                      className="fh-recipe-input fh-small"
                      required
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
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
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
