import React, { useState } from "react";
import "../../styles/FridgeManager.css";
import { MoreVertical, Edit2, Trash2, RefreshCw, Plus } from "lucide-react";

const ingredients = [
  {
    name: "Chicken Breast",
    quantity: "500g",
    category: "Meat",
    location: "Main Fridge",
    expiry: "Dec 28, 2024",
    status: "Expiring Soon",
    icon: "🍗",
    expiredDays: 286,
  },
  {
    name: "Fresh Milk",
    quantity: "1L",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Dec 25, 2024",
    status: "Expired",
    icon: "🥛",
    expiredDays: 290,
  },
  {
    name: "Broccoli",
    quantity: "300g",
    category: "Vegetables",
    location: "Crisper Drawer",
    expiry: "Jan 5, 2025",
    status: "Fresh",
    icon: "🥦",
    expiredDays: 0,
  },
  {
    name: "Eggs",
    quantity: "12 pcs",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Jan 10, 2025",
    status: "Fresh",
    icon: "🥚",
    expiredDays: 0,
  },
  {
    name: "Tomatoes",
    quantity: "6 pcs",
    category: "Vegetables",
    location: "Main Fridge",
    expiry: "Jan 2, 2025",
    status: "Expiring Soon",
    icon: "🍅",
    expiredDays: 0,
  },
  {
    name: "Butter",
    quantity: "200g",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Jan 20, 2025",
    status: "Fresh",
    icon: "🧈",
    expiredDays: 0,
  },
];

const statusInfo = {
  Fresh: {
    class: "status-fresh",
    icon: "✅",
    text: "Fresh",
  },
  "Expiring Soon": {
    class: "status-expiring",
    icon: "⚠️",
    text: "Expiring Soon",
  },
  Expired: {
    class: "status-expired",
    icon: "⛔",
    text: "Expired",
  },
};

export default function FridgeManager() {
  const [menuIndex, setMenuIndex] = useState(null);

  // Đóng menu khi click ra ngoài
  React.useEffect(() => {
    const close = () => setMenuIndex(null);
    if (menuIndex !== null) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [menuIndex]);

  return (
    <div className="fridge-manager fridge-bg">
      {/* Header Section */}
      <div className="fridge-hero-row">
        <div className="fridge-hero-left">
          <div className="fridge-hero-title">
            <span role="img" aria-label="wave" className="fridge-hero-emoji">
              👋
            </span>
            <span className="fridge-hero-hi">
              Hi Huy! Let's check your fridge today
            </span>
          </div>
          <div className="fridge-hero-desc">
            Keep your ingredients fresh and reduce food waste
          </div>
        </div>
        <div className="fridge-hero-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1046/1046857.png"
            alt="Chibi fridge character"
            className="fridge-hero-img"
          />
        </div>
      </div>

      {/* Alert */}
      <div className="alert-box-card">
        <span style={{ marginRight: 8 }}>
          ⚠️<span style={{ color: "#facc15", marginLeft: 2 }}>▲</span>
        </span>
        <div>
          <b>
            You have 1 expired item.
            <br />2 items are expiring soon.
          </b>
        </div>
      </div>

      {/* Header row */}
      <div className="fridge-header-row">
        <h2>Your Ingredients</h2>
        <button className="add-btn-card">
          <Plus size={18} style={{ marginRight: 6 }} /> Add Ingredient
        </button>
      </div>

      {/* Card Grid */}
      <div className="ingredient-card-grid">
        {ingredients.map((item, idx) => (
          <div
            className="ingredient-card styled-card"
            key={idx}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-top-row">
              <div className="ingredient-icon-circle">
                <span className="ingredient-icon">{item.icon || ""}</span>
              </div>
              <div className="card-menu-wrap">
                <button
                  className="card-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuIndex(menuIndex === idx ? null : idx);
                  }}
                >
                  <MoreVertical size={20} />
                </button>
                {menuIndex === idx && (
                  <div className="card-menu-dropdown styled-dropdown">
                    <button className="dropdown-item">
                      <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
                    </button>
                    <button className="dropdown-item">
                      <RefreshCw size={16} style={{ marginRight: 8 }} /> Update
                      expiry
                    </button>
                    <button className="dropdown-item delete">
                      <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="ingredient-name">{item.name}</div>
            <div className="ingredient-qty">{item.quantity}</div>
            <div className="ingredient-info">
              <div>
                <span className="info-label">Category:</span>{" "}
                <b>{item.category}</b>
              </div>
              <div>
                <span className="info-label">Location:</span>{" "}
                <b>{item.location}</b>
              </div>
              <div className="expiry-row">
                <span className="info-label">Expires:</span>
                <span className="expiry-badge">{item.expiry}</span>
              </div>
            </div>
            <div
              className={`ingredient-status ${statusInfo[item.status].class}`}
            >
              {statusInfo[item.status].text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
