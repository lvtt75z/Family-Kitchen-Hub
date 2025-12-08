// ...existing code...
import React, { useState, useEffect } from "react";
import axios from "../../hooks/axios"; // file cấu hình axios riêng
import "./../../styles/FridgeManager.css";
import bgIngredients from "../../assets/bgIg3.jpg";
import AddIngredientModal from "../AddIngredientScreen";
import { Plus, MoreVertical } from "lucide-react";

export default function FridgeManager() {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    ingredientName: "",
    quantity: "",
    unit: "",
    expirationDate: "",
  });

  const token = localStorage.getItem("token");

  // GET inventory list
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        if (!userDataString) return;

        const userData = JSON.parse(userDataString);
        const userId = userData.id;

        const res = await axios.get(
          `http://localhost:8080/api/inventory/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIngredients(res.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchIngredients();
  }, [token]);

  // POST add ingredient
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      const userDataString = localStorage.getItem("user");
      const userData = JSON.parse(userDataString);
      const userId = userData.user?.id || userData.id;

      const payload = {
        userId: userId,
        ingredientId: newIngredient.ingredientId || undefined,
        ingredientName: newIngredient.ingredientName || undefined,
        quantity: newIngredient.quantity
          ? parseFloat(newIngredient.quantity)
          : 0,
        unit: newIngredient.unit || undefined,
        expirationDate: newIngredient.expirationDate || undefined,
      };

      await axios.post("http://localhost:8080/api/inventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowModal(false);
      setNewIngredient({
        ingredientId: "",
        ingredientName: "",
        quantity: "",
        unit: "",
        expirationDate: "",
      });

      const res = await axios.get(
        `http://localhost:8080/api/inventory/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIngredients(res.data);
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const getStatus = (expDate) => {
    if (!expDate) return "Fresh";
    const today = new Date();
    const expiry = new Date(expDate);
    const diff = (expiry - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "Expired";
    if (diff <= 3) return "Expiring Soon";
    return "Fresh";
  };

  const formatDate = (d) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  return (
    <div className="fridge-manager">
      {/* Welcome Section */}
      <div
        className="welcome-section"
        style={{
          backgroundImage: `url(${bgIngredients})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "110vh",
        }}
      >
        <div className="welcome-text">
          <h1>Welcome to Fridge Manager! Let’s check your fridge today</h1>
          <p>Keep your ingredients fresh and reduce food waste</p>
        </div>
      </div>

      {/* Header */}
      <div className="header-fridge">
        <h2>Your Ingredients</h2>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Ingredient
        </button>
      </div>

      {/* Ingredient Grid */}
      <div className="ingredient-grid">
        {ingredients.map((item) => {
          const status = getStatus(item.expirationDate);

          return (
            <div
              key={item.id}
              className={`ingredient-card ${status
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              <div className="card-header">
                <h3>{item.ingredientName}</h3>
                <MoreVertical size={16} />
              </div>

              <p className="info">
                <strong>Số lượng:</strong> {item.quantity ?? "-"}
              </p>

              <p className="info">
                <strong>Đơn vị:</strong> {item.unit || "-"}
              </p>

              <p className="info">
                <strong>Mã nguyên liệu:</strong> {item.ingredientId ?? "-"}
              </p>

              <div className="nutrition">
                <p className="nutrition-title">Hạn sử dụng:</p>
                <p className="nutrition-value">
                  {formatDate(item.expirationDate)}
                </p>
              </div>

              <div
                className={`status ${status.toLowerCase().replace(" ", "-")}`}
              >
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Add Inventory Item */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Inventory Item</h3>

              {/* Nút mở modal thứ hai */}
              <button onClick={() => setShowIngredientModal(true)}>
                Add Ingredients
              </button>

              <button className="icon-btn" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddIngredient}>
              <label>
                Ingredient Name
                <input
                  type="text"
                  value={newIngredient.ingredientName}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      ingredientId: e.target.value,
                    })
                  }
                  placeholder="e.g. 1"
                />
              </label>

              <label>
                Quantity
                <input
                  type="number"
                  step="any"
                  value={newIngredient.quantity}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      quantity: e.target.value,
                    })
                  }
                  required
                  placeholder="e.g. 15"
                />
              </label>

              <label>
                Unit
                <input
                  type="text"
                  value={newIngredient.unit}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, unit: e.target.value })
                  }
                  placeholder="e.g. cái, kg"
                  required
                />
              </label>

              <label>
                Expiration Date
                <input
                  type="date"
                  value={newIngredient.expirationDate}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      expirationDate: e.target.value,
                    })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Ingredients Modal */}
      {showIngredientModal && (
        <AddIngredientModal
          onClose={() => {
            setShowIngredientModal(false);
            setShowModal(true);
          }}
          onSelect={(selected) => {
            // 🎯 Nhận dữ liệu từ Modal 2
            setNewIngredient((prev) => ({
              ...prev,
              ingredientName: selected.ingredientName,
              unit: selected.unit,
            }));

            setShowIngredientModal(false); // đóng modal 2
            setShowModal(true); // mở modal 1 lại
          }}
        />
      )}
    </div>
  );
}
