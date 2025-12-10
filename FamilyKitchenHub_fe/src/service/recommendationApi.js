import axios from "../hooks/axios";

// GET /api/recommend - AI meal recommendation
// Response: { recipes: [...], targetMealCalories: number, ... }
export const getMealRecommendations = async () => {
  const res = await axios.get("/recommend");
  return res.data;
};

export default {
  getMealRecommendations,
};

