import axios from "../hooks/axios";

// Flask AI API base URL (running on separate port)
const FLASK_API_URL = "http://localhost:5002";

/**
 * Get smart meal recommendations from Flask AI API
 * This function:
 * 1. Fetches inventory items from Spring Boot backend
 * 2. Fetches family member profiles (with allergies) from Spring Boot backend
 * 3. Fetches all recipes from Spring Boot backend
 * 4. Transforms data to Flask API format
 * 5. Sends POST request to Flask API
 * 6. Maps Flask response to UI format
 */
export const getMealRecommendations = async () => {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw new Error("User not authenticated");
    }
    const user = JSON.parse(userStr);
    const userId = user.id;

    // Step 1: Fetch inventory items for the current user
    const inventoryResponse = await axios.get(`/inventory/user/${userId}`);
    const inventoryItems = inventoryResponse.data || [];

    // Step 2: Fetch family members for the current user
    const familyResponse = await axios.get(`/family-members/user/${userId}`);
    const familyMembers = familyResponse.data || [];

    // Step 3: Fetch all recipes
    const recipesResponse = await axios.get("/recipes");
    const allRecipes = recipesResponse.data || [];

    // Debug logging
    console.log("📊 Fetched Data for Recommendations:");
    console.log("  Inventory Items:", inventoryItems.length, inventoryItems);
    console.log("  Family Members:", familyMembers.length, familyMembers);
    console.log("  Recipes:", allRecipes.length);
    if (allRecipes.length > 0) {
      console.log("  Sample Recipe:", allRecipes[0]);
    }

    // Step 4: Transform data to Flask API format
    const flaskPayload = {
      current_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      inventory_items: inventoryItems.map((item) => ({
        ingredient_id: item.ingredientId,
        quantity: item.quantity || 0,
        unit: item.unit || "g",
        expiration_date: item.expirationDate || null, // YYYY-MM-DD format
      })),
      family_profiles: familyMembers.map((member) => ({
        id: member.id,
        name: member.name,
        allergies: member.allergies ? member.allergies.map((a) => a.id) : [],
        health_goals: member.tastePreferences
          ? member.tastePreferences.split(",").map(t => t.trim())
          : [],
      })),
      all_recipes: allRecipes.map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        categories: recipe.categories ? recipe.categories.map((c) => c.name) : [],
        ingredients: recipe.ingredients
          ? recipe.ingredients.map((ing) => ({
            ingredient_id: ing.ingredientId || ing.id,
            quantity: ing.quantity || 0,
            unit: ing.unit || "g",
            is_main_ingredient: ing.isMainIngredient || false,
          }))
          : [],
      })),
    };

    console.log("🚀 Sending to Flask API:", {
      inventory_count: flaskPayload.inventory_items.length,
      family_count: flaskPayload.family_profiles.length,
      recipe_count: flaskPayload.all_recipes.length,
      sample_recipe: flaskPayload.all_recipes[0],
    });

    // Step 5: Send request to Flask AI API
    const flaskResponse = await fetch(`${FLASK_API_URL}/recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(flaskPayload),
    });

    if (!flaskResponse.ok) {
      const errorText = await flaskResponse.text();
      console.error("Flask API Error Response:", errorText);
      throw new Error(`Flask API error: ${flaskResponse.status} - ${errorText}`);
    }

    const flaskData = await flaskResponse.json();
    console.log("✅ Flask API Response:", flaskData);

    // Step 6: Map Flask response to UI format
    const recommendations = flaskData.recommendations || [];

    // Calculate target meal calories based on family members
    // Simple formula: avg 2000 kcal per person
    const targetMealCalories = familyMembers.length > 0
      ? familyMembers.length * 2000
      : 2000;

    // Map recommended recipe IDs back to full recipe data
    const enrichedRecipes = recommendations.map((rec) => {
      const recipe = allRecipes.find((r) => r.id === rec.recipe_id);
      if (!recipe) return null;

      // Calculate ingredient availability
      const recipeIngredients = recipe.ingredients || [];
      const availableIngredients = recipeIngredients.filter((ing) =>
        inventoryItems.some((inv) => inv.ingredientId === (ing.ingredientId || ing.id))
      );
      const missingIngredients = recipeIngredients
        .filter(
          (ing) =>
            !inventoryItems.some((inv) => inv.ingredientId === (ing.ingredientId || ing.id))
        )
        .map((ing) => ing.ingredientName || ing.name || "Unknown");

      // Generate reason badges based on score components
      const reasons = [];

      // Check for expiring ingredients (score > 50 typically means rescue bonus)
      if (rec.score > 50) {
        const expiringCount = inventoryItems.filter((inv) => {
          if (!inv.expirationDate) return false;
          const daysLeft = Math.floor(
            (new Date(inv.expirationDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          return daysLeft >= 0 && daysLeft <= 3;
        }).length;

        if (expiringCount > 0) {
          reasons.push({
            type: "Giải cứu",
            message: `Dùng ${expiringCount} nguyên liệu sắp hết hạn`,
          });
        }
      }

      // Economic reason - if has many available ingredients
      const availabilityPercent = recipeIngredients.length > 0
        ? Math.round((availableIngredients.length / recipeIngredients.length) * 100)
        : 0;

      if (availabilityPercent >= 70) {
        reasons.push({
          type: "Kinh tế",
          message: `Có sẵn ${availabilityPercent}% nguyên liệu`,
        });
      }

      // Nutritional reason - check categories
      const healthyCategories = ["Healthy", "Low-Carb", "High-Protein", "Vegetarian"];
      const hasHealthyCategory = recipe.categories?.some((c) =>
        healthyCategories.includes(c.name)
      );

      if (hasHealthyCategory) {
        reasons.push({
          type: "Dinh dưỡng",
          message: "Phù hợp với mục tiêu sức khỏe",
        });
      }

      // Preference reason - matches family taste
      if (recipe.categories && recipe.categories.length > 0) {
        const matchingPreferences = familyMembers.filter((member) => {
          if (!member.tastePreferences) return false;
          const prefs = member.tastePreferences.split(",").map((p) => p.trim());
          return recipe.categories.some((c) => prefs.includes(c.name));
        });

        if (matchingPreferences.length > 0) {
          reasons.push({
            type: "Sở thích",
            message: `Hợp khẩu vị ${matchingPreferences.map((m) => m.name).join(" & ")}`,
          });
        }
      }

      // If no reasons, add a default one
      if (reasons.length === 0) {
        reasons.push({
          type: "Khác",
          message: "Món ăn phù hợp",
        });
      }

      return {
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl || recipe.image || null,
        matchScore: Math.min(100, Math.max(0, rec.score)), // Normalize to 0-100
        totalCalories: recipe.calories || 1500, // Default if not available
        cookingTimeMinutes: recipe.cookingTime || 30,
        servings: recipe.servings || familyMembers.length || 4,
        availableIngredients: availableIngredients.length,
        totalIngredients: recipeIngredients.length,
        missingIngredients,
        reasons,
      };
    }).filter((r) => r !== null); // Remove null entries

    return {
      recipes: enrichedRecipes,
      targetMealCalories,
      total_analyzed: flaskData.total_analyzed || allRecipes.length,
    };
  } catch (error) {
    console.error("Error fetching meal recommendations:", error);

    // Provide more specific error messages
    if (error.message.includes("Flask API")) {
      throw new Error(
        "Không thể kết nối với AI Server. Vui lòng đảm bảo Flask server đang chạy trên port 5001."
      );
    }

    throw error;
  }
};

export default {
  getMealRecommendations,
};

