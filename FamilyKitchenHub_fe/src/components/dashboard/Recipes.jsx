import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/Recipes.css";
import {
  Heart,
  HeartOff,
  Trash2,
  Clock,
  Users,
  ChefHat,
  PlusCircle,
  X,
} from "lucide-react";

export default function RecipeDashboard() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    instructions: "",
    cookingTimeMinutes: "",
    servings: "",
    imageUrl: "", // 🟢 đổi từ imageFile sang imageUrl
  });
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");
  const [allIngredients, setAllIngredients] = useState([]); // ✅ danh sách từ API

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

    if (isOpen) fetchIngredients(); // chỉ gọi khi modal mở
  }, [isOpen]);
  // Lấy danh sách công thức
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await axios.get("/recipes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(res.data);
      } catch (err) {
        console.error("❌ Lỗi khi tải recipes:", err);
      }
    };
    fetchRecipes();
  }, [token]);

  //  Mở / đóng modal
  const openModal = () => {
    setForm({
      title: "",
      instructions: "",
      cookingTimeMinutes: "",
      servings: "",
      imageUrl: "",
    });
    setPreview(null);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  // Xử lý nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 🖼️ Nếu người dùng nhập imageUrl thì hiển thị preview
    if (name === "imageUrl") {
      setPreview(value || null);
    }
  };

  // Gửi JSON request
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
        imageUrl: form.imageUrl || null, //  chỉ gửi link ảnh
        ingredients: (form.ingredients || []).map((i) => ({
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
      closeModal();
      setForm({
        title: "",
        instructions: "",
        cookingTimeMinutes: "",
        servings: "",
        imageUrl: "",
      });
      setPreview(null);
      alert("Thêm công thức thành công!");
    } catch (err) {
      console.error("Lỗi khi thêm recipe:", err.response || err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Không thể thêm công thức.";
      alert(msg);
    }
  };

  const handleCardClick = (id) => {
    navigate(`/manage/recipes/${id}`);
  };

  //  Xóa công thức
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa công thức này?")) return;
    try {
      await axios.delete(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(" Lỗi khi xóa recipe:", err);
    }
  };

  return (
    <div className="recipe-dashboard">
      {/* Header */}
      <header className="recipe-header">
        <div className="title-wrap">
          <h1>🍽️ Your Favorite Recipes</h1>
          <p>Discover and cook delicious meals for your family.</p>
        </div>
        <button className="add-btn" onClick={openModal}>
          <PlusCircle size={16} /> Add Recipe
        </button>
      </header>

      {/* Recipe Grid */}
      <div className="recipe-grid">
        {recipes.length === 0 ? (
          <div className="empty">No recipes found.</div>
        ) : (
          recipes.map((r) => (
            <div
              className="recipe-card"
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(r.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleCardClick(r.id);
              }}
            >
              <div className="card-image">
                <img src={r.imageUrl} alt={r.title} />
                <span className="category-tag">Recipe</span>
              </div>
              <div className="card-body">
                <div className="card-header">
                  <h3>{r.title}</h3>
                  <div className="card-actions">
                    {r.favorite ? (
                      <Heart color="red" size={18} />
                    ) : (
                      <HeartOff size={18} />
                    )}
                    <Trash2
                      color="gray"
                      size={18}
                      className="delete-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(r.id);
                      }}
                    />
                  </div>
                </div>

                <p className="desc">{r.instructions}</p>

                <div className="card-info">
                  <div className="info-icons">
                    <Clock size={16} /> <span>{r.cookingTimeMinutes} phút</span>
                    <Users size={16} /> <span>{r.servings} người</span>
                    <ChefHat size={16} /> <span>Ready!</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add */}
      {isOpen && (
        <div className={`modal-overlay ${isOpen ? "active" : ""}`}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add Recipe</h3>
              <button className="icon-btn" onClick={closeModal}>
                <X />
              </button>
            </div>

            <form className="recipe-modal-form" onSubmit={handleAdd}>
              <label className="recipe-label">
                Title
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Fried Chicken"
                  required
                  className="recipe-input"
                />
              </label>

              <label className="recipe-label">
                Instructions
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder="e.g. Mix ingredients and fry until golden..."
                  required
                  className="recipe-textarea"
                />
              </label>

              <div className="recipe-form-grid">
                <label className="recipe-label">
                  Time (minutes)
                  <input
                    type="number"
                    name="cookingTimeMinutes"
                    value={form.cookingTimeMinutes}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    className="recipe-input"
                  />
                </label>

                <label className="recipe-label">
                  Servings
                  <input
                    type="number"
                    name="servings"
                    value={form.servings}
                    onChange={handleChange}
                    placeholder="e.g. 4"
                    className="recipe-input"
                  />
                </label>
              </div>

              {/* 🟢 Thay phần chọn file bằng nhập URL */}
              <label className="recipe-label">
                Image URL
                <input
                  type="text"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="recipe-input"
                />
              </label>

              {preview && (
                <div className="recipe-image-preview">
                  <img src={preview} alt="Preview" className="recipe-image" />
                </div>
              )}
              {/* 🧄 🧩 THÊM PHẦN NÀY NGAY Ở ĐÂY */}
              <div className="ingredients-section">
                <div className="ingredients-header">
                  <h4>Ingredients</h4>
                  <button
                    type="button"
                    className="add-ingredient-btn"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        ingredients: [
                          ...(prev.ingredients || []),
                          { ingredientId: "", quantity: "" },
                        ],
                      }))
                    }
                  >
                    + Add Ingredient
                  </button>
                </div>

                {(form.ingredients || []).map((ing, index) => (
                  <div key={index} className="ingredient-row">
                    <select
                      value={ing.ingredientId}
                      onChange={(e) => {
                        const newIngredients = [...form.ingredients];
                        newIngredients[index].ingredientId = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          ingredients: newIngredients,
                        }));
                      }}
                      className="recipe-input small"
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
                      type="text"
                      placeholder="Quantity (e.g. 1kg)"
                      value={ing.quantity}
                      onChange={(e) => {
                        const newIngredients = [...form.ingredients];
                        newIngredients[index].quantity = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          ingredients: newIngredients,
                        }));
                      }}
                      className="recipe-input small"
                      required
                    />

                    <button
                      type="button"
                      className="remove-ingredient-btn"
                      onClick={() => {
                        const newIngredients = form.ingredients.filter(
                          (_, i) => i !== index
                        );
                        setForm((prev) => ({
                          ...prev,
                          ingredients: newIngredients,
                        }));
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {/*   */}
              <div className="recipe-modal-actions">
                <button
                  type="button"
                  className="recipe-btn ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="recipe-btn primary">
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
