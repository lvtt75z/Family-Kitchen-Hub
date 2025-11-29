import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/DetailRecipes.css";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipe(res.data);
    };
    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="recipe-detail-hl">
      <div className="top-nav">
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="detail-container">
        {/* LEFT SIDE */}
        <div className="left-content">
          <div className="signature-tag">
            <span>Signature</span>
          </div>

          <h1 className="title_recipe">{recipe.title}</h1>

          <p className="subtitle">Perfect For All Soup Bases</p>

          <div className="ingredients-table">
            {recipe.ingredients?.map((item, i) => (
              <div key={i} className="row">
                <span className="ingredient-name">{item.ingredientName}</span>
                <span className="ingredient-quantity">
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="right-image">
          <img src={recipe.imageUrl} alt={recipe.title} />
        </div>
        <div className="instructions-section">
          <h2 className="instruction-title">Instructions</h2>
          <span>{recipe.instructions}</span>
        </div>
      </div>
    </div>
  );
}
