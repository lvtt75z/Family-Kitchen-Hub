import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import blobs from "../assets/blob-scene-haikei.svg";
import {
  Calendar,
  Snowflake,
  BookOpen,
  HeartPulse,
  Apple,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import cookingAnimation from "../assets/kitchen_cooking.mp4";
import axios from "../hooks/axios";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 5.2 – Xem danh sách tất cả công thức: GET /api/recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/recipes");
        setRecipes(res.data || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);



  return (
    <div className="home">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <span className="badge">
              🌟 New with AI-powered meal suggestions
            </span>
            <h1>
              Smart Family <span className="highlight">Meal Planning</span> Made
              Simple
            </h1>
            <p className="hero-text">
              Transform your family's eating habits with intelligent meal
              planning, automated grocery lists, and personalized nutrition
              tracking.
            </p>

            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate("/manage/recommendations")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={18} /> Gợi ý thực đơn ngay
              </button>
              <button className="btn-outline">See Demo</button>
            </div>
          </div>

          <div className="hero-right">
            <video
              src={cookingAnimation}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: "100%", borderRadius: "12px" }}
            />
          </div>
        </div>
      </section>

      <div className="usually-recipes">
        <h2>Usually Recipes</h2>

        <div className="recipe-content">
          <div className="circle"></div>
          <div className="circle"></div>
          <div className="circle"></div>
        </div>

        <img src={blobs} alt="blobs" className="svg-wave" />
      </div>

      {/* ===== RECIPE SUGGESTIONS (From backend) ===== */}
      <section className="suggestions-section">
        <div className="suggestions-header">
          <h2>Recipe Suggestions</h2>
          <p>Danh sách công thức từ hệ thống của bạn.</p>
        </div>

        {loading ? (
          <p>Đang tải danh sách công thức...</p>
        ) : recipes.length === 0 ? (
          <p>Chưa có công thức nào.</p>
        ) : (
          <div className="suggestions-grid">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="suggestion-card"
                onClick={() => navigate(`/manage/recipesdetails/${recipe.id}`)}
              >
                <div className="suggestion-image">
                  <img
                    src={recipe.imageUrl || "/placeholder-recipe.jpg"}
                    alt={recipe.title}
                  />
                  <button className="heart-btn" aria-label="Add to favorites">
                    ♡
                  </button>
                </div>
                <div className="suggestion-content">
                  <h3>{recipe.title}</h3>
                  <div className="suggestion-meta">
                    <span className="time">
                      ⏱ {recipe.cookingTimeMinutes || "--"} min
                    </span>
                    <span className="area">
                      🍽 {recipe.servings ? `${recipe.servings} servings` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features">
        <div className="features-header">
          <span className="badge badge-blue">Features</span>
          <h2>Everything your family needs for healthy eating</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Calendar size={24} color="#f97316" />
            </div>
            <h3>Smart Menu Planning</h3>
            <p>AI-powered meal planning for the whole family.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Snowflake size={24} color="#3b82f6" />
            </div>
            <h3>Fridge Management</h3>
            <p>Track ingredients and avoid waste.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <BookOpen size={24} color="#10b981" />
            </div>
            <h3>Recipe Collection</h3>
            <p>Organize and search recipes easily.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <HeartPulse size={24} color="#ef4444" />
            </div>
            <h3>Family Health Profiles</h3>
            <p>Customized nutrition tracking per family member.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Apple size={24} color="#84cc16" />
            </div>
            <h3>Nutrition Tracking</h3>
            <p>Stay on top of calories and nutrients.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShoppingCart size={24} color="#a855f7" />
            </div>
            <h3>Smart Shopping Lists</h3>
            <p>Auto-generate shopping lists from meal plans.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
