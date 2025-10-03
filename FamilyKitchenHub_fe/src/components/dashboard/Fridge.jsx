import React from "react";
import "../../styles/FridgeManager.css";
import { AlertTriangle, Trash2 } from "lucide-react";

const ingredients = [
  {
    name: "Ground Beef",
    quantity: "500 g",
    category: "Meat",
    location: "Freezer",
    expiry: "1/15/2024",
    status: "Expired",
  },
  {
    name: "Tomatoes",
    quantity: "6 pcs",
    category: "Vegetables",
    location: "Main compartment",
    expiry: "1/10/2024",
    status: "Expired",
  },
  {
    name: "Chicken Eggs",
    quantity: "12 pcs",
    category: "Dairy & Eggs",
    location: "Door",
    expiry: "1/12/2024",
    status: "Expired",
  },
  {
    name: "Fresh Milk",
    quantity: "1 carton",
    category: "Dairy & Eggs",
    location: "Main compartment",
    expiry: "1/13/2024",
    status: "Expired",
  },
];

export default function FridgeManager() {
  return (
    <div className="fridge-manager">
      <header>
        <h1>Fridge Manager</h1>
        <p>Track ingredients and manage expiration dates</p>
        <h2>Fridge Manager</h2>
        <p className="subtext">Track food and ingredients in your refrigerator</p>
      </header>

      <div className="alert-box">
        <AlertTriangle color="#f97316" size={20} />
        <div>
          <strong>Expiration Alerts:</strong>{" "}
          <span className="alert-text">
            4 ingredients have expired: Ground Beef, Tomatoes, Chicken Eggs, Fresh Milk
          </span>
        </div>
        <button className="add-btn">+ Add Ingredient</button>
      </div>

      <div className="ingredient-table">
        <h3>Ingredient List ({ingredients.length} items)</h3>
        <table>
          <thead>
            <tr>
              <th>Ingredient Name</th>
              <th>Quantity</th>
              <th>Category</th>
              <th>Location</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.category}</td>
                <td>{item.location}</td>
                <td>{item.expiry}</td>
                <td>
                  <span className="status-expired">{item.status}</span>
                </td>
                <td>
                  <button className="delete-btn">
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
