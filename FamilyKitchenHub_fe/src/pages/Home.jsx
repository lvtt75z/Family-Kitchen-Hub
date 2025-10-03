import React from "react";
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
  return (
    <div className="home">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-container">
          {/* Left content */}
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
              tracking. Join over 50,000 families eating healthier together.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary">Get Started Free</button>
              <button className="btn-outline">See Demo</button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                {/* ⭐ icon */}
                <span className="icon">★</span> 4.9/5 rating
              </div>
              <div className="stat-item">
                {/* 👨‍👩‍👧 icon */}
                <span className="icon">👨‍👩‍👧</span> 50,000+ families
              </div>
              <div className="stat-item">
                {/* ⏰ icon */}
                <span className="icon">⏰</span> Free 30-day trial
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="hero-right">
            
              <video
                src={cookingAnimation}
                autoPlay
                loop
                muted
                playsInline
                style={{ width: "100%", borderRadius: "12px" }}
              />
            
            <div className="hero-image"></div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features">
        <div className="features-header">
          <span className="badge badge-blue">Features</span>
          <h2>Everything your family needs for healthy eating</h2>
          <p>
            From intelligent meal planning to nutrition tracking, our
            comprehensive platform makes healthy family eating effortless and
            enjoyable.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card">
            <div className="feature-icon">
              <Calendar size={24} color="#f97316" /> {/* cam tươi */}
            </div>
            <h3>Smart Menu Planning</h3>
            <p>
              AI-powered suggestions based on family preferences, dietary
              restrictions, and nutritional goals.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card">
            <div className="feature-icon">
              <Snowflake size={24} color="#3b82f6" /> {/* xanh dương */}
            </div>
            <h3>Fridge Management</h3>
            <p>
              Track ingredients, monitor expiration dates, and reduce food waste
              with smart inventory management.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card">
            <div className="feature-icon">
              <BookOpen size={24} color="#10b981" /> {/* xanh ngọc */}
            </div>
            <h3>Recipe Collection</h3>
            <p>
              Organize, search, and discover recipes with advanced filtering and
              personalized recommendations.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="feature-card">
            <div className="feature-icon">
              <HeartPulse size={24} color="#ef4444" /> {/* đỏ tươi */}
            </div>
            <h3>Family Health Profiles</h3>
            <p>
              AI-powered suggestions based on family preferences, dietary
              restrictions, and nutritional goals.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="feature-card">
            <div className="feature-icon">
              <Apple size={24} color="#84cc16" /> {/* xanh lá */}
            </div>
            <h3>Nutrition Tracking</h3>
            <p>
              Track ingredients, monitor expiration dates, and reduce food waste
              with smart inventory management.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="feature-card">
            <div className="feature-icon">
              <ShoppingCart size={24} color="#a855f7" /> {/* tím sáng */}
            </div>
            <h3>Smart Shopping Lists</h3>
            <p>
              Organize, search, and discover recipes with advanced filtering and
              personalized recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
