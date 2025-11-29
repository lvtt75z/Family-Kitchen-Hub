// ...existing code...
import React, { useState, useEffect } from "react";
import axios from "../../hooks/axios"; // file cấu hình axios riêng
import "./../../styles/FridgeManager.css";
import bgIngredients from "../../assets/bgIg3.jpg";
import { Plus, MoreVertical } from "lucide-react";

export default function FridgeManager() {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    ingredientId: "",
    ingredientName: "",
    quantity: "",
    unit: "",
    expirationDate: "",
  });

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // GET nguyên liệu từ /api/inventory
useEffect(() => {
  const fetchIngredients = async () => {
    try {
      // Lấy object từ localStorage
      const userDataString = localStorage.getItem("user"); // key lưu object JSON
      if (!userDataString) {
        console.error("User data not found in localStorage");
        return;
      }

      const userData = JSON.parse(userDataString);

      const userId = userData.id;
      console.log(userId); // hoặc userData.user.id nếu lưu như bạn gửi
      if (!userId) {
        console.error("User ID not found in localStorage");
        return;
      }

      const res = await axios.get(`http://localhost:8080/api/inventory/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIngredients(res.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  fetchIngredients();
}, [token]);




// POST thêm nguyên liệu vào /api/inventory 
const handleAddIngredient = async (e) => {
  e.preventDefault();
  try {
    // Lấy userId từ localStorage
    const userDataString = localStorage.getItem("user");
    const userData = JSON.parse(userDataString);
    const userId = userData.user?.id || userData.id; // tùy cấu trúc lưu trong storage

    // chuẩn hóa dữ liệu trước gửi
    const payload = {
      userId: userId, // thêm userId vào payload nếu backend cần
      ingredientId: newIngredient.ingredientId || undefined,
      ingredientName: newIngredient.ingredientName || undefined,
      quantity: newIngredient.quantity ? parseFloat(newIngredient.quantity) : 0,
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

    // refresh list theo userId
    const res = await axios.get(`http://localhost:8080/api/inventory/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIngredients(res.data);
  } catch (error) {
    console.error("Error adding ingredient:", error);
  }
};


  const getStatus = (expDate) => {
    if (!expDate) return "Fresh";
    const today = new Date();
    const expiry = new Date(expDate);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return "Expired";
    if (diffDays <= 3) return "Expiring Soon";
    return "Fresh";
  };

  // helper format date
  const formatDate = (d) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  return (
    <div className="fridge-manager">
      {/* Welcome Section */}
      <div className="welcome-section"
      style={{
        backgroundImage: `url(${bgIngredients})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "110vh",
      }}>
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
              className={`ingredient-card ${status.toLowerCase().replace(" ", "-")}`}
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
                <p className="nutrition-value">{formatDate(item.expirationDate)}</p>
              </div>

              <div className={`status ${status.toLowerCase().replace(" ", "-")}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Inventory Item</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddIngredient}>
              <label>
                Ingredient ID
                <input
                  type="text"
                  value={newIngredient.ingredientId}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, ingredientId: e.target.value })
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
                    setNewIngredient({ ...newIngredient, quantity: e.target.value })
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
                    setNewIngredient({ ...newIngredient, expirationDate: e.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>
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
    </div>
  );
}
