package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.SimilarRecipeDTO;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.RecipeIngredientRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for Recipe Recommendations (Feature 7.2)
 * 
 * Similarity Algorithm:
 * - Shared Categories: +5 points each (strongest signal)
 * - Shared Ingredients: +2 points each (practical similarity)
 * - Similar Cooking Time: +1 point (within 15 minutes)
 */
@Service
public class RecipeRecommendationService {

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    /**
     * Find similar recipes based on categories, ingredients, and cooking time
     * 
     * @param recipeId Target recipe ID
     * @param limit    Maximum number of results (default 10)
     * @return List of similar recipes sorted by similarity score (descending)
     */
    public List<SimilarRecipeDTO> findSimilarRecipes(Long recipeId, Integer limit) {
        // Get target recipe
        Recipe targetRecipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        // Get target recipe data
        Set<Long> targetCategoryIds = getCategoryIds(recipeId);
        Set<Long> targetIngredientIds = getIngredientIds(recipeId);
        Integer targetCookingTime = targetRecipe.getCookingTimeMinutes();

        // Get all other recipes (exclude target)
        List<Recipe> allRecipes = recipeRepository.findAll().stream()
                .filter(r -> !r.getId().equals(recipeId))
                .collect(Collectors.toList());

        // Calculate similarity for each recipe
        List<SimilarRecipeDTO> results = allRecipes.stream()
                .map(recipe -> calculateSimilarity(
                        recipe,
                        targetCategoryIds,
                        targetIngredientIds,
                        targetCookingTime))
                .filter(dto -> dto.getSimilarityScore() > 0) // Only return if score > 0
                .sorted((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()))
                .limit(limit != null ? limit : 10)
                .collect(Collectors.toList());

        return results;
    }

    /**
     * Calculate similarity score between target and candidate recipe
     * 
     * Scoring System:
     * 1. Categories: +5 points per shared category
     * 2. Ingredients: +2 points per shared ingredient
     * 3. Cooking Time: +1 point if difference ≤ 15 minutes
     */
    private SimilarRecipeDTO calculateSimilarity(Recipe candidate,
            Set<Long> targetCategories,
            Set<Long> targetIngredients,
            Integer targetCookingTime) {
        double score = 0;
        List<String> reasons = new ArrayList<>();

        // Get candidate recipe data
        Set<Long> candidateCategories = getCategoryIds(candidate.getId());
        Set<Long> candidateIngredients = getIngredientIds(candidate.getId());

        // ============================================
        // FACTOR 1: Shared Categories (+5 points each)
        // ============================================
        Set<Long> commonCategories = new HashSet<>(targetCategories);
        commonCategories.retainAll(candidateCategories); // Find intersection
        if (!commonCategories.isEmpty()) {
            score += commonCategories.size() * 5; // +5 points per category
            reasons.add(commonCategories.size() + " danh mục chung");
        }

        // ============================================
        // FACTOR 2: Shared Ingredients (+2 points each)
        // ============================================
        Set<Long> commonIngredients = new HashSet<>(targetIngredients);
        commonIngredients.retainAll(candidateIngredients); // Find intersection
        if (!commonIngredients.isEmpty()) {
            score += commonIngredients.size() * 2; // +2 points per ingredient
            reasons.add(commonIngredients.size() + " nguyên liệu chung");
        }

        // ============================================
        // FACTOR 3: Similar Cooking Time (+1 point if ≤15 min diff)
        // ============================================
        if (targetCookingTime != null && candidate.getCookingTimeMinutes() != null) {
            int timeDiff = Math.abs(targetCookingTime - candidate.getCookingTimeMinutes());
            if (timeDiff <= 15) { // Within 15 minutes
                score += 1; // +1 bonus point
                reasons.add("Thời gian nấu gần nhau");
            }
        }

        // ============================================
        // Build result DTO with score and explanation
        // ============================================
        SimilarRecipeDTO dto = new SimilarRecipeDTO(
                candidate.getId(),
                candidate.getTitle(),
                candidate.getImageUrl(),
                candidate.getCookingTimeMinutes(),
                candidate.getServings(),
                score, // Total similarity score
                String.join(", ", reasons) // Human-readable explanation
        );

        return dto;
    }

    /**
     * Get category IDs for a recipe
     */
    private Set<Long> getCategoryIds(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId).orElse(null);
        if (recipe == null) {
            return new HashSet<>();
        }
        return recipe.getCategories().stream()
                .map(category -> category.getId())
                .collect(Collectors.toSet());
    }

    /**
     * Get ingredient IDs for a recipe
     */
    private Set<Long> getIngredientIds(Long recipeId) {
        return recipeIngredientRepository.findByRecipeId(recipeId).stream()
                .map(ri -> ri.getIngredient().getId())
                .collect(Collectors.toSet());
    }
}
