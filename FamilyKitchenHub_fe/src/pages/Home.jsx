import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import {
  Calendar,
  Snowflake,
  BookOpen,
  HeartPulse,
  Apple,
  ShoppingCart,
} from "lucide-react";
import cookingAnimation from "../assets/kitchen_cooking.mp4";

function Home() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch 6 random meals from TheMealDB
  useEffect(() => {
    const fetchRandomMeals = async () => {
      setLoading(true);
      try {
        const requests = Array.from({ length: 10 }, () =>
          fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(
            (res) => res.json()
          )
        );

        const results = await Promise.all(requests);
        const randomMeals = results
          .map((res) => res.meals && res.meals[0])
          .filter(Boolean);
        setMeals(randomMeals);
      } catch (error) {
        console.error("Error fetching meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomMeals();
  }, []);


  // Mock categories
  const categories = [
    { id: 1, name: "Breakfast", emoji: "🍳" },
    { id: 2, name: "Vegan", emoji: "🥗" },
    { id: 3, name: "Meat", emoji: "🍖" },
    { id: 4, name: "Dessert", emoji: "🍰" },
    { id: 5, name: "Lunch", emoji: "🍱" },
    { id: 6, name: "Chocolate", emoji: "🍫" },
  ];

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
              <button className="btn-primary">Get Started Free</button>
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

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="categories-section">
        <div className="categories-header">
          <h2>Categories</h2>
          <a href="#" className="view-all-link">
            View all Categories →
          </a>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="category-icon">{cat.emoji}</div>
              <p className="category-name">{cat.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== MEAL SUGGESTIONS (Dynamic) ===== */}
      <section className="suggestions-section">
        <div className="suggestions-header">
          <h2>Random Meal Suggestions (via TheMealDB)</h2>
          <p>
            Freshly fetched from TheMealDB API every time you load the page.
          </p>
        </div>

        {loading ? (
          <p>Loading random meals...</p>
        ) : (
          <div className="suggestions-grid">
            {meals.map((meal) => (
              <div key={meal.idMeal} className="suggestion-card">
                <div className="suggestion-image">
                  <img src={meal.strMealThumb} alt={meal.strMeal} />
                  <button className="heart-btn" aria-label="Add to favorites">
                    ♡
                  </button>
                </div>
                <div className="suggestion-content">
                  <h3>{meal.strMeal}</h3>
                  <div className="suggestion-meta">
                    <span className="time">🍽 {meal.strCategory}</span>
                    <span className="area">🌎 {meal.strArea}</span>
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
