import React, { useState } from "react";
import { Plus, Clock, Users, X } from "lucide-react";
import "./../../styles/MealPlaner.css";

const mealData = [
  {
    day: "Monday",
    date: "Dec 23",
    meals: {
      breakfast: {
        name: "Scrambled Eggs with Toast",
        time: "15 min",
        servings: "2 servings",
        image:
          "https://images.unsplash.com/photo-1604908177522-040c8de81b18?auto=format&fit=crop&w=400&q=80",
      },
      lunch: {
        name: "Grilled Chicken Salad",
        time: "25 min",
        servings: "2 servings",
        image:
          "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80",
      },
      dinner: null,
    },
  },
  {
    day: "Tuesday",
    date: "Dec 24",
    meals: { breakfast: null, lunch: null, dinner: null },
  },
  {
    day: "Wednesday",
    date: "Dec 25",
    meals: { breakfast: null, lunch: null, dinner: null },
  },
  {
    day: "Thursday",
    date: "Dec 26",
    meals: { breakfast: null, lunch: null, dinner: null },
  },
];

export default function MealPlanner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="meal-planner-wrap">
      <div className="planner-header">
        <div className="header-actions">
          <button className="btn primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add Meal
          </button>
          <button className="btn ghost">🛒 Shopping List</button>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-grid">
        {mealData.map((day, i) => (
          <div key={i} className="day-column">
            <div className="day-header">
              <h3>{day.day}</h3>
              <p className="muted">{day.date}</p>
            </div>

            {["breakfast", "lunch", "dinner"].map((mealKey, j) => {
              const meal = day.meals[mealKey];
              const icon =
                mealKey === "breakfast"
                  ? "☕"
                  : mealKey === "lunch"
                  ? "🌞"
                  : "🍌";

              return (
                <div key={j} className="meal-card">
                  <div className="meal-header">
                    <span className="meal-icon">{icon}</span>
                    <strong className="meal-title">
                      {mealKey.charAt(0).toUpperCase() + mealKey.slice(1)}
                    </strong>
                    <button
                      className="icon-btn"
                      onClick={() => setShowModal(true)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {meal ? (
                    <div className="meal-body">
                      <img src={meal.image} alt={meal.name} />
                      <div className="meal-info">
                        <div className="meal-name-row">
                          <h4>{meal.name}</h4>
                          <button className="icon-btn small delete">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="meal-meta">
                          <span>
                            <Clock size={14} /> {meal.time}
                          </span>
                          <span>
                            <Users size={14} /> {meal.servings}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="muted no-meal">No meal planned</p>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ===== Modal Add Meal ===== */}
      <div className={`modal-overlay ${showModal ? "active" : ""}`}>
        <div className="modal">
          <div className="modal-header">
            <h3>Add a Meal</h3>
            <button className="icon-btn" onClick={() => setShowModal(false)}>
              <X />
            </button>
          </div>
          <form className="modal-form">
            <label>
              Meal Name
              <input type="text" placeholder="e.g. Grilled Salmon Bowl" />
            </label>
            <div className="form-grid">
              <label>
                Duration
                <input type="text" placeholder="e.g. 20 min" />
              </label>
              <label>
                Servings
                <input type="number" placeholder="2" />
              </label>
            </div>
            <label>
              Image URL
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
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
                Save Meal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
