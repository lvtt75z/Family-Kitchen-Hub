import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../hooks/axios";
import "./../../styles/DetailRecipes.css";
import { Clock, Users } from "lucide-react";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipeDetail = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`/recipes/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRecipe(response.data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
        setError(err.response?.data?.message || "Could not load recipe");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetail();
    }
  }, [id]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!recipe) return <div className="not-found">Recipe not found</div>;

  return (
    <div className="recipe-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Recipes
      </button>

      {/* Hero Section */}
      <div className="recipe-hero">
        <img
          src={recipe.imageUrl || "/placeholder-recipe.jpg"}
          alt={recipe.title}
          className="recipe-image"
        />
        <div className="recipe-overlay">
          <span className="recipe-tag">Recipe</span>
          <h1>{recipe.title}</h1>
          <div className="recipe-meta">
            <span>
              <Clock size={16} /> {recipe.cookingTimeMinutes} min
            </span>
            <span>
              <Users size={16} /> {recipe.servings} servings
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="recipe-desc">{recipe.instructions}</p>

      {/* Content Section */}
      <div className="recipe-content">
        {/* Ingredients */}
        <div className="ingredients-card">
          <h2>Ingredients</h2>
          <ul>
            {recipe.ingredients?.map((ingredient) => (
              <li key={ingredient.ingredientId}>
                <span>
                  {ingredient.ingredientName} ({ingredient.quantity} {ingredient.unit})
                </span>
                <span className="in-fridge">In Fridge</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h2>Instructions</h2>
          <ol>
            {recipe.instructions.split('\n').map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}