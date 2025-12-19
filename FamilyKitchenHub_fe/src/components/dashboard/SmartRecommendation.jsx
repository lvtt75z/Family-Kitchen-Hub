import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMealRecommendations } from "../../service/recommendationApi";
import { cookRecipe } from "../../service/recipesApi";
import { Sparkles, ArrowLeft, Clock, Users, Zap, ChefHat } from "lucide-react";
import { convertMediaUrl } from "../../utils/mediaUtils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/SmartRecommendation.css";

export default function SmartRecommendation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Đang kiểm tra tủ lạnh...");
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [cookingRecipe, setCookingRecipe] = useState(null); // Track which recipe is being cooked

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Simulate loading steps
        const messages = [
          "Đang kiểm tra tủ lạnh...",
          "Đang tính toán calo cho cả nhà...",
          "Đang phân tích sở thích...",
          "Đang tìm món phù hợp nhất...",
        ];

        let messageIndex = 0;
        const messageInterval = setInterval(() => {
          if (messageIndex < messages.length - 1) {
            messageIndex++;
            setLoadingMessage(messages[messageIndex]);
          }
        }, 1500);



        // Fetch real recommendations from Flask AI API
        const data = await getMealRecommendations();
        clearInterval(messageInterval);
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(err.response?.data?.message || "Không thể tải gợi ý. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Handle cook recipe
  const handleCookRecipe = async (recipeId, recipeTitle) => {
    try {
      setCookingRecipe(recipeId);

      // Get userId from localStorage
      const userDataString = localStorage.getItem("user");
      let userId = null;
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          userId = userData.user?.id || userData.id;
        } catch (e) {
          console.warn("Cannot parse user data:", e);
        }
      }

      // Call cook recipe API
      const response = await cookRecipe(recipeId, userId);

      // Show success message with deducted ingredients
      const ingredientsList = response.deductedIngredients
        ?.map((ing) => {
          const status = ing.removedFromInventory
            ? " (đã hết)"
            : ` (còn lại: ${ing.remainingQuantity} ${ing.unit})`;
          return `• ${ing.ingredientName}: -${ing.deductedQuantity} ${ing.unit}${status}`;
        })
        .join("\n") || "";

      toast.success(
        <div>
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            {response.message || `Đã nấu món "${recipeTitle}" thành công!`}
          </div>
          {ingredientsList && (
            <div style={{ fontSize: "12px", whiteSpace: "pre-line", textAlign: "left" }}>
              {ingredientsList}
            </div>
          )}
        </div>,
        { autoClose: 3000 }
      );

      // Navigate to recipe details after a short delay
      setTimeout(() => {
        navigate(`/manage/recipesdetails/${recipeId}`);
      }, 1500);
    } catch (error) {
      console.error("Error cooking recipe:", error);

      // Show error message
      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Không thể nấu món ăn. Vui lòng kiểm tra nguyên liệu trong tủ lạnh.";

      toast.error(errorMessage, { autoClose: 4000 });
    } finally {
      setCookingRecipe(null);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return "#10b981"; // Green
    if (score >= 50) return "#f59e0b"; // Yellow
    return "#f97316"; // Orange
  };

  const getBadgeColor = (type) => {
    const colors = {
      "Giải cứu": "#ef4444", // Red
      "Kinh tế": "#f97316", // Orange (thay vì Blue để match với design)
      "Dinh dưỡng": "#10b981", // Green
      "Sở thích": "#a855f7", // Purple
    };
    return colors[type] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="recommendation-container">
        <div className="loading-state">
          <div className="loading-animation">
            <Sparkles size={48} color="#f97316" />
          </div>
          <h2>Đang tạo gợi ý thực đơn...</h2>
          <p className="loading-message">{loadingMessage}</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-container">
        <div className="error-state">
          <h2>Oops! Có lỗi xảy ra</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations || !recommendations.recipes || recommendations.recipes.length === 0) {
    return (
      <div className="recommendation-container">
        <div className="empty-state">
          <h2>Chưa có gợi ý phù hợp</h2>
          <p>Vui lòng thêm nguyên liệu vào tủ lạnh để nhận gợi ý.</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const { recipes, targetMealCalories } = recommendations;

  return (
    <div className="recommendation-container">
      <ToastContainer />
      <div className="recommendation-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h1 className="recommendation-title">
          <Sparkles size={24} /> Hôm nay gia đình ăn gì?
        </h1>
        {targetMealCalories && (
          <p className="target-calories">
            Mục tiêu năng lượng: {targetMealCalories} kcal
          </p>
        )}
      </div>

      <div className="recommendations-grid">
        {recipes.map((recipe, index) => {
          const matchScore = recipe.matchScore || 0;
          const scoreColor = getMatchScoreColor(matchScore);
          const caloriesPercent = targetMealCalories
            ? Math.min(100, Math.round((recipe.totalCalories / targetMealCalories) * 100))
            : 0;

          return (
            <div key={recipe.id || index} className="recommendation-card">
              {/* Image & Title */}
              <div className="recipe-image-wrapper">
                <img
                  src={convertMediaUrl(recipe.imageUrl) || "/placeholder-recipe.jpg"}
                  alt={recipe.title}
                  className="recipe-image"
                />
                <div className="match-score-circle" style={{ borderColor: scoreColor }}>
                  <span style={{ color: scoreColor }}>Phù hợp</span>

                </div>
              </div>

              <div className="recipe-content">
                <h3 className="recipe-title">{recipe.title}</h3>

                {/* Badges - Lý do gợi ý */}
                {recipe.reasons && recipe.reasons.length > 0 && (
                  <div className="reason-badges">
                    {recipe.reasons.map((reason, idx) => {
                      const badgeType = reason.type || "Khác";
                      const badgeColor = getBadgeColor(badgeType);
                      return (
                        <span
                          key={idx}
                          className="reason-badge"
                          style={{
                            backgroundColor: `${badgeColor}15`,
                            color: badgeColor,
                            borderColor: badgeColor,
                          }}
                        >
                          {reason.type === "Giải cứu" && "🚨"}
                          {reason.type === "Kinh tế" && "💰"}
                          {reason.type === "Dinh dưỡng" && "🥗"}
                          {reason.type === "Sở thích" && "❤️"}
                          {reason.message || reason.type}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Nutrition Info */}
                {recipe.totalCalories && targetMealCalories && (
                  <div className="nutrition-info">
                    <div className="nutrition-label">
                      <span>Năng lượng cung cấp</span>
                      <span className="nutrition-value">
                        {recipe.totalCalories} / {targetMealCalories} kcal ({caloriesPercent}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${caloriesPercent}%`,
                          backgroundColor: caloriesPercent >= 90 ? "#10b981" : caloriesPercent >= 70 ? "#f59e0b" : "#f97316",
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Ingredients Info */}
                {recipe.ingredients && (
                  <div className="ingredients-info">
                    <div className="ingredients-summary">
                      <span className="ingredients-label">
                        Bạn có: {recipe.availableIngredients || 0} / {recipe.totalIngredients || recipe.ingredients.length} nguyên liệu
                      </span>
                    </div>
                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                      <div className="missing-ingredients">
                        <small>
                          Thiếu: {recipe.missingIngredients.join(", ")}
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {/* Meta Info */}
                <div className="recipe-meta">
                  {recipe.cookingTimeMinutes && (
                    <span className="meta-item">
                      <Clock size={14} /> {recipe.cookingTimeMinutes} phút
                    </span>
                  )}
                  {recipe.servings && (
                    <span className="meta-item">
                      <Users size={14} /> {recipe.servings} phần
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="recipe-actions">
                  <button
                    className="btn-cook-recipe"
                    onClick={() => handleCookRecipe(recipe.id, recipe.title)}
                    disabled={cookingRecipe === recipe.id}
                    style={{
                      backgroundColor: "#f97316",
                      color: "white",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      cursor: cookingRecipe === recipe.id ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "500",
                      marginBottom: "8px",
                      opacity: cookingRecipe === recipe.id ? 0.6 : 1,
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <ChefHat size={16} />
                    {cookingRecipe === recipe.id ? "Đang nấu..." : "Nấu"}
                  </button>
                  <button
                    className="btn-view-recipe"
                    onClick={() => navigate(`/manage/recipesdetails/${recipe.id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

