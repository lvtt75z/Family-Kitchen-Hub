import React, { useState, useEffect } from "react";
import axios from "../hooks/axios"; // axios đã config baseURL + token
import "./../styles/AddIngredientScreen.css";
import { X, Search } from "lucide-react";

export default function AddIngredientModal({ onClose, onSelect }) {
  const [tab, setTab] = useState("quick");
  const [ingredients, setIngredients] = useState([]);
  const [search, setSearch] = useState("");

  // Load ingredients từ backend
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await axios.get("/ingredients");
        setIngredients(res.data);
      } catch (err) {
        console.error("Error loading ingredients:", err);
      }
    };
    loadIngredients();
  }, []);

  const filteredIngredients = ingredients.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ai-overlay">
      <div className="ai-modal">
        {/* Header */}
        <div className="ai-header">
          <h2>Add Ingredient</h2>
          <button className="ai-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="ai-tabs">
          <button
            className={tab === "quick" ? "active" : ""}
            onClick={() => setTab("quick")}
          >
            Quick Add
          </button>
          <button
            className={tab === "custom" ? "active" : ""}
            onClick={() => setTab("custom")}
          >
            Custom Entry
          </button>
        </div>

        {/* QUICK ADD */}
        {tab === "quick" && (
          <>
            <div className="ai-search-wrapper">
              <Search size={18} className="ai-search-icon" />
              <input
                type="text"
                className="ai-search"
                placeholder="Search ingredient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <h4 className="ai-title">Common Ingredients</h4>

            <div className="ai-suggestions">
              {filteredIngredients.map((item) => {
                let nutrition = {};
                try {
                  nutrition = JSON.parse(item.nutritionalInfo);
                } catch {}

                return (
                  <div
                    key={item.id}
                    className="ai-card"
                    onClick={() => {
                      if (onSelect) {
                        onSelect({
                          ingredientId: item.id,
                          ingredientName: item.name,
                          unit: item.unit,
                          nutrition,
                        });
                      }
                      if (onClose) onClose();
                    }}
                  >
                    <h5>{item.name}</h5>
                    <p>{item.unit}</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CUSTOM ENTRY */}
        {tab === "custom" && (
          <form
            className="ai-form"
            onSubmit={async (e) => {
              e.preventDefault();

              const newIngredient = {
                name: e.target.name.value,
                unit: e.target.unit.value,
                nutritionalInfo: {
                  protein: e.target.protein?.value || "0g",
                  fat: e.target.fat?.value || "0g",
                  calories: parseInt(e.target.calories?.value) || 0,
                  day: parseInt(e.target.day?.value) || 0,
                },
              };

              try {
                const res = await axios.post("/ingredients", newIngredient);
                console.log("Ingredient added:", res.data);

                if (onSelect) {
                  onSelect({
                    ingredientId: res.data.id,
                    ingredientName: res.data.name,
                    unit: res.data.unit,
                    nutrition: res.data.nutritionalInfo,
                  });
                }

                if (onClose) onClose();
              } catch (err) {
                console.error("Error adding ingredient:", err);
                alert("Failed to add ingredient. Please check your input.");
              }
            }}
          >
            <label>
              Ingredient Name
              <input name="name" required />
            </label>

            <label>
              Unit
              <input name="unit" required />
            </label>

            <label>
              Protein (g)
              <input name="protein" type="number" />
            </label>

            <label>
              Fat (g)
              <input name="fat" type="number" />
            </label>

            <label>
              Calories
              <input name="calories" type="number" />
            </label>

            <label>
              Day
              <input name="day" type="number" />
            </label>

            <button type="submit" className="ai-submit">
              Add Ingredient
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
