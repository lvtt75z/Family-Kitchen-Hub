import axios from "../hooks/axios";

// Flask AI API base URL (running on separate port)
// Use Vite proxy to avoid CORS issues
const FLASK_API_URL = import.meta.env.DEV 
  ? "/api/flask"  // Use proxy in development
  : "http://localhost:5001";  // Direct URL in production (if needed)

/**
 * Check if an inventory item is still valid (not expired)
 * @param {Object} inventoryItem - Inventory item with expirationDate
 * @returns {boolean} - True if item is still valid, false if expired 
 */
const isInventoryItemValid = (inventoryItem) => {
  if (!inventoryItem.expirationDate) {
    // If no expiration date, consider it valid
    return true;
  }
  
  const expirationDate = new Date(inventoryItem.expirationDate);
  const today = new Date();
  // Set time to midnight for accurate day comparison
  today.setHours(0, 0, 0, 0);
  expirationDate.setHours(0, 0, 0, 0);
  
  // Item is valid if expiration date is today or in the future
  return expirationDate >= today;
};

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
    // Filter out expired inventory items before sending to Flask
    const validInventoryItems = inventoryItems.filter(isInventoryItemValid);
    const expiredCount = inventoryItems.length - validInventoryItems.length;
    if (expiredCount > 0) {
      console.log(`🗑️ Excluding ${expiredCount} expired ingredient(s) from recommendations`);
    }
    
    const flaskPayload = {
      current_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      inventory_items: validInventoryItems.map((item) => ({
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
    const apiUrl = `${FLASK_API_URL}/recommend`;
    console.log("🌐 Flask API URL:", apiUrl, "(Using proxy:", import.meta.env.DEV ? "Yes" : "No", ")");
    const flaskResponse = await fetch(apiUrl, {
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
    console.log("📋 Recommendations from Flask:", flaskData.recommendations?.length || 0, "recipes");

    // Step 6: Map Flask response to UI format
    let recommendations = flaskData.recommendations || [];
    
    // Fallback: If Flask returns too many recommendations (likely all recipes),
    // or if recommendations array is empty, filter recipes locally based on ingredient availability
    if (recommendations.length === 0 || recommendations.length > allRecipes.length * 0.8) {
      console.log("⚠️ Flask returned too many/all recipes. Filtering locally based on ingredient availability...");
      
      // Use the already filtered validInventoryItems (expired items already excluded)
      // Create a map of valid inventory ingredient IDs for quick lookup
      const validInventoryIngredientIds = new Set(
        validInventoryItems.map(item => item.ingredientId)
      );
      
      // Filter and score recipes locally
      recommendations = allRecipes
        .map(recipe => {
          const recipeIngredients = recipe.ingredients || [];
          const availableCount = recipeIngredients.filter(ing => 
            validInventoryIngredientIds.has(ing.ingredientId || ing.id)
          ).length;
          
          const availabilityPercent = recipeIngredients.length > 0
            ? Math.round((availableCount / recipeIngredients.length) * 100)
            : 0;
          
          // Only include recipes with at least 30% ingredients available
          if (availabilityPercent < 30) return null;
          
          // Calculate a simple score based on availability
          let score = availabilityPercent;
          
          // Bonus for recipes with more available ingredients
          if (availabilityPercent >= 70) score += 20;
          if (availabilityPercent >= 90) score += 10;
          
          return {
            recipe_id: recipe.id,
            score: Math.min(100, score)
          };
        })
        .filter(r => r !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Limit to top 10
      
      console.log("🔍 Local filtering found", recommendations.length, "suitable recipes");
    }

    // Calculate target meal calories based on family members
    // Simple formula: avg 2000 kcal per person
    const targetMealCalories = familyMembers.length > 0
      ? familyMembers.length * 2000
      : 2000;

    // Map recommended recipe IDs back to full recipe data
    const enrichedRecipes = recommendations.map((rec) => {
      const recipe = allRecipes.find((r) => r.id === rec.recipe_id);
      if (!recipe) {
        console.warn("⚠️ Recipe not found for ID:", rec.recipe_id);
        return null;
      }

      // Calculate ingredient availability (only count non-expired ingredients)
      // Use the already filtered validInventoryItems (expired items already excluded)
      const recipeIngredients = recipe.ingredients || [];
      const availableIngredients = recipeIngredients.filter((ing) =>
        validInventoryItems.some((inv) => inv.ingredientId === (ing.ingredientId || ing.id))
      );
      const missingIngredients = recipeIngredients
        .filter(
          (ing) =>
            !validInventoryItems.some((inv) => inv.ingredientId === (ing.ingredientId || ing.id))
        )
        .map((ing) => ing.ingredientName || ing.name || "Unknown");

      // Generate reason badges based on score components
      const reasons = [];

      // Check for expiring ingredients (score > 50 typically means rescue bonus)
      // Only check valid (non-expired) ingredients
      if (rec.score > 50) {
        const expiringCount = validInventoryItems.filter((inv) => {
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

      // Calculate availability percentage (used for filtering and reasons)
      const availabilityPercent = recipeIngredients.length > 0
        ? Math.round((availableIngredients.length / recipeIngredients.length) * 100)
        : 0;

      // Economic reason - if has many available ingredients
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
        matchScore: Math.min(100, Math.max(0, rec.score || 0)), // Normalize to 0-100
        totalCalories: recipe.calories || 1500, // Default if not available
        cookingTimeMinutes: recipe.cookingTime || 30,
        servings: recipe.servings || familyMembers.length || 4,
        availableIngredients: availableIngredients.length,
        totalIngredients: recipeIngredients.length,
        availabilityPercent, // Add this for filtering
        missingIngredients,
        reasons,
      };
    }).filter((r) => {
      // Filter out null entries and recipes with no ingredients
      if (!r) return false;
      
      // Only show recipes that have at least 30% of ingredients available
      // OR have a high match score from Flask (> 50)
      const hasMinimumIngredients = r.availabilityPercent >= 30;
      const hasHighScore = r.matchScore > 50;
      
      return hasMinimumIngredients || hasHighScore;
    });

    // Sort by availability percentage (descending) and then by match score (descending)
    enrichedRecipes.sort((a, b) => {
      // First sort by availability percentage
      if (b.availabilityPercent !== a.availabilityPercent) {
        return b.availabilityPercent - a.availabilityPercent;
      }
      // Then by match score
      return b.matchScore - a.matchScore;
    });

    console.log("🎯 Filtered Recommendations:", enrichedRecipes.length, "recipes");
    console.log("📊 Top 3 recommendations:", enrichedRecipes.slice(0, 3).map(r => ({
      title: r.title,
      availability: `${r.availabilityPercent}%`,
      score: r.matchScore
    })));

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

