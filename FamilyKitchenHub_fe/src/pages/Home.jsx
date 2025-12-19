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
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import cookingAnimation from "../assets/kitchen_cooking.mp4";
import axios from "../hooks/axios";
import { getTopBookmarkedRecipes, addRecipeBookmark, removeRecipeBookmark, getRecipeById } from "../service/recipesApi";
import { Heart } from "lucide-react";
import { convertMediaUrl } from "../utils/mediaUtils";

function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topBookmarked, setTopBookmarked] = useState([]);
  const [loadingBookmarked, setLoadingBookmarked] = useState(true);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState(new Set());
  const [bookmarking, setBookmarking] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const navigate = useNavigate();

  // 5.2 – Xem danh sách tất cả công thức: GET /api/dashboard/popular-recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/dashboard/popular-recipes", {
          params: { limit: 10 } // Get top 10 popular recipes
        });
        const recipesData = res.data || [];

        // Map RecipePopularityResponseDTO fields to match expected format
        const validRecipes = recipesData
          .map(recipe => ({
            id: recipe.recipeId,           // Map recipeId -> id
            title: recipe.recipeTitle,      // Map recipeTitle -> title
            imageUrl: recipe.imageUrl,
            bookmarkCount: recipe.bookmarkCount,
            popularityScore: recipe.popularityScore,
            searchCount: recipe.searchCount,
            cookingTimeMinutes: recipe.cookingTimeMinutes || 30, // Default if not provided
            servings: recipe.servings || 4  // Default if not provided
          }))
          .filter(recipe => {
            if (!recipe.id) {
              console.warn("Recipe without ID:", recipe);
              return false;
            }
            return true;
          });

        setRecipes(validRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Fetch top bookmarked recipes
  const fetchTopBookmarked = async () => {
    setLoadingBookmarked(true);
    try {
      const data = await getTopBookmarkedRecipes(5);
      const bookmarkedData = data || [];

      // Filter out recipes without valid IDs
      const validBookmarked = bookmarkedData.filter(recipe => {
        const id = recipe.id || recipe.recipeId;
        if (!id) {
          console.warn("Bookmarked recipe without ID:", recipe);
          return false;
        }
        return true;
      });

      // Fetch full recipe details for each bookmarked recipe
      const recipesWithDetails = await Promise.all(
        validBookmarked.map(async (recipe) => {
          const recipeId = recipe.id || recipe.recipeId;
          try {
            // If recipe already has all needed fields, use it
            if (recipe.title && recipe.imageUrl && recipe.cookingTimeMinutes !== undefined) {
              return recipe;
            }

            // Otherwise, fetch full details
            const fullRecipe = await getRecipeById(recipeId);
            return {
              ...fullRecipe,
              bookmarkCount: recipe.bookmarkCount || fullRecipe.bookmarkCount || 0,
              id: recipeId
            };
          } catch (error) {
            console.error(`Error fetching recipe ${recipeId} details:`, error);
            // Return original recipe if fetch fails
            return recipe;
          }
        })
      );

      // Debug: Log first recipe to check structure
      if (recipesWithDetails.length > 0) {
        console.log("Sample bookmarked recipe structure:", recipesWithDetails[0]);
      }

      setTopBookmarked(recipesWithDetails);
    } catch (error) {
      console.error("Error fetching top bookmarked recipes:", error);
    } finally {
      setLoadingBookmarked(false);
    }
  };

  useEffect(() => {
    fetchTopBookmarked();
  }, []);

  // Calculate slides per view based on window width
  useEffect(() => {
    const calculateSlidesPerView = () => {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 768) return 2;
      return 3;
    };

    const updateSlidesPerView = () => {
      const newSlidesPerView = calculateSlidesPerView();
      setSlidesPerView(newSlidesPerView);

      // Adjust current slide if needed
      const maxSlide = Math.max(0, topBookmarked.length - newSlidesPerView);
      if (currentSlide > maxSlide) {
        setCurrentSlide(maxSlide);
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, [topBookmarked.length, currentSlide]);

  // Handle bookmark toggle
  const handleBookmark = async (e, recipeId) => {
    e.stopPropagation(); // Prevent card click navigation

    const userDataString = localStorage.getItem("user");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.user?.id || userData?.id || localStorage.getItem("userId");

    if (!userId) {
      alert("Vui lòng đăng nhập để bookmark công thức");
      return;
    }

    const isBookmarked = bookmarkedRecipes.has(recipeId);
    setBookmarking(prev => ({ ...prev, [recipeId]: true }));

    try {
      if (isBookmarked) {
        await removeRecipeBookmark(recipeId, Number(userId));
        setBookmarkedRecipes(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
      } else {
        await addRecipeBookmark(recipeId, { userId: Number(userId) });
        setBookmarkedRecipes(prev => new Set(prev).add(recipeId));
      }

      // Reload top bookmarked list
      await fetchTopBookmarked();

      // Update bookmark count in recipes list
      setRecipes(prevRecipes =>
        prevRecipes.map(recipe =>
          recipe.id === recipeId
            ? { ...recipe, bookmarkCount: (recipe.bookmarkCount || 0) + (isBookmarked ? -1 : 1) }
            : recipe
        )
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("Có lỗi xảy ra khi bookmark công thức");
    } finally {
      setBookmarking(prev => ({ ...prev, [recipeId]: false }));
    }
  };




  // Scroll Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Small delay to ensure DOM is rendered
    setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [recipes, topBookmarked, currentSlide]); // Check updates

  return (
    <div className="home">
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-left">
            <span className="badge-home">
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
                className="btn-primary-suggestions"
                onClick={() => navigate("/manage/recommendations")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Sparkles size={18} /> Gợi ý thực đơn ngay
              </button>
              <button className="btn-outline">Khám phá ngay</button>
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
        <h2>Top Bookmarked Recipes</h2>

        <div className="recipe-content">
          {loadingBookmarked ? (
            <p>Đang tải công thức được bookmark nhiều nhất...</p>
          ) : topBookmarked.length === 0 ? (
            <p>Chưa có công thức nào được bookmark.</p>
          ) : (
            <div className="bookmarked-slider">
              <div className="slider-container">
                <button
                  className="slider-btn slider-btn-prev"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  aria-label="Previous slide"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="slider-track" style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}>
                  {topBookmarked.map((recipe, index) => {
                    const recipeId = recipe.id || recipe.recipeId;
                    if (!recipeId) return null;

                    return (
                      <div
                        key={recipeId || `bookmarked-${index}`}
                        className="bookmarked-slide scroll-reveal"
                        style={{ transitionDelay: `${index * 0.3}s` }}
                      >
                        <div
                          className="bookmarked-card"
                          onClick={() => recipeId && navigate(`/manage/recipesdetails/${recipeId}`)}
                        >
                          <div className="bookmarked-image">
                            <img
                              src={convertMediaUrl(recipe.imageUrl) || "/placeholder-recipe.jpg"}
                              alt={recipe.title}
                            />
                            <div className="bookmark-badge">
                              ⭐ {recipe.bookmarkCount || 0} bookmarks
                            </div>
                            <button
                              className={`bookmark-btn ${bookmarkedRecipes.has(recipeId) ? 'bookmarked' : ''}`}
                              onClick={(e) => handleBookmark(e, recipeId)}
                              disabled={bookmarking[recipeId]}
                              aria-label={bookmarkedRecipes.has(recipeId) ? "Remove bookmark" : "Add bookmark"}
                              title={bookmarkedRecipes.has(recipeId) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Heart
                                size={22}
                                fill={bookmarkedRecipes.has(recipeId) ? "#ea580c" : "none"}
                                color="#ea580c"
                                strokeWidth={2.5}
                              />
                            </button>
                          </div>
                          <div className="bookmarked-content">
                            <h3>{recipe.title}</h3>
                            <div className="bookmarked-meta">
                              <span className="time">
                                ⏱ {recipe.cookingTimeMinutes || recipe.cookingTime || "--"} min
                              </span>
                              <span className="area">
                                🍽 {recipe.servings ? `${recipe.servings} servings` : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="slider-btn slider-btn-next"
                  onClick={() => {
                    const maxSlide = Math.max(0, topBookmarked.length - slidesPerView);
                    setCurrentSlide(Math.min(maxSlide, currentSlide + 1));
                  }}
                  disabled={currentSlide >= Math.max(0, topBookmarked.length - slidesPerView)}
                  aria-label="Next slide"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="slider-dots">
                {Array.from({ length: Math.ceil(topBookmarked.length / slidesPerView) }).map((_, index) => (
                  <button
                    key={index}
                    className={`slider-dot ${Math.floor(currentSlide / slidesPerView) === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index * slidesPerView)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <img src={blobs} alt="blobs" className="svg-wave" />
      </div>

      {/* ===== RECIPE SUGGESTIONS (From backend) ===== */}
      <section className="suggestions-section">
        <div className="suggestions-header">
          <h2>Top 10 Recipes</h2>
          <p>(Calculated based on total of views, bookmarks and searches)</p>
        </div>

        {loading ? (
          <p>Đang tải danh sách công thức...</p>
        ) : recipes.length === 0 ? (
          <p>Chưa có công thức nào.</p>
        ) : (
          <div className="suggestions-grid">
            {recipes.map((recipe, index) => {
              const recipeId = recipe.id || recipe.recipeId;
              if (!recipeId) return null;

              return (
                <div
                  key={recipeId || `recipe-${index}`}
                  className="suggestion-card scroll-reveal"
                  onClick={() => recipeId && navigate(`/manage/recipesdetails/${recipeId}`)}
                  style={{ transitionDelay: `${index * 0.3}s` }}
                >
                  <div className="suggestion-image scroll-reveal" style={{ transitionDelay: `${index * 0.3}s` }}>
                    <img
                      src={convertMediaUrl(recipe.imageUrl) || "/placeholder-recipe.jpg"}
                      alt={recipe.title}
                    />

                    <button
                      className={`heart-btn ${bookmarkedRecipes.has(recipeId) ? "bookmarked" : ""}`}
                      onClick={(e) => handleBookmark(e, recipeId)}
                      disabled={bookmarking[recipeId]}
                      aria-label={
                        bookmarkedRecipes.has(recipeId)
                          ? "Remove bookmark"
                          : "Add bookmark"
                      }
                      title={
                        bookmarkedRecipes.has(recipeId)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Heart
                        size={22}
                        fill={bookmarkedRecipes.has(recipeId) ? "#ff6b6b" : "none"}
                        color={bookmarkedRecipes.has(recipeId) ? "#ff6b6b" : "#2d3748"}
                        strokeWidth={2.5}
                      />
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
              );
            })}
          </div>
        )}
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features">
        <div className="features-header">
          <span className="badge-home badge-blue">Features</span>
          <h2>Everything your family needs for healthy eating</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="feature-icon">
              <Calendar size={24} color="#f97316" />
            </div>
            <h3>Smart Menu Planning</h3>
            <p>AI-powered meal planning for the whole family.</p>
          </div>

          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.2s' }}>
            <div className="feature-icon">
              <Snowflake size={24} color="#3b82f6" />
            </div>
            <h3>Fridge Management</h3>
            <p>Track ingredients and avoid waste.</p>
          </div>

          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.3s' }}>
            <div className="feature-icon">
              <BookOpen size={24} color="#10b981" />
            </div>
            <h3>Recipe Collection</h3>
            <p>Organize and search recipes easily.</p>
          </div>

          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.4s' }}>
            <div className="feature-icon">
              <HeartPulse size={24} color="#ef4444" />
            </div>
            <h3>Family Health Profiles</h3>
            <p>Protect family health by avoiding allergy food.</p>
          </div>

          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.5s' }}>
            <div className="feature-icon">
              <Apple size={24} color="#84cc16" />
            </div>
            <h3>Nutrition Tracking</h3>
            <p>Enough calories with AI recommendations.</p>
          </div>

          <div className="feature-card scroll-reveal" style={{ transitionDelay: '0.6s' }}>
            <div className="feature-icon">
              <MessageCircle size={24} color="#a855f7" />
            </div>
            <h3>Recipe Community</h3>
            <p>Discuss and try new dishes through comments.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
