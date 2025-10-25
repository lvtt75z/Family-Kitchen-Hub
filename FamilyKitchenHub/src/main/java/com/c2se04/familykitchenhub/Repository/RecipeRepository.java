package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    
    // Search by title (case-insensitive, partial match)
    List<Recipe> findByTitleContainingIgnoreCase(String title);
    
    // Filter by maximum cooking time
    List<Recipe> findByCookingTimeMinutesLessThanEqual(Integer maxMinutes);
    
    // Filter by exact servings
    List<Recipe> findByServings(Integer servings);
    
    // Filter by servings range
    List<Recipe> findByServingsBetween(Integer minServings, Integer maxServings);
    
    // Combined: search title and max cooking time
    List<Recipe> findByTitleContainingIgnoreCaseAndCookingTimeMinutesLessThanEqual(String title, Integer maxMinutes);
    
    // Find recipes by ingredient name
    @Query("SELECT DISTINCT r FROM Recipe r " +
           "JOIN r.recipeIngredients ri " +
           "JOIN ri.ingredient i " +
           "WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :ingredientName, '%'))")
    List<Recipe> findByIngredientName(@Param("ingredientName") String ingredientName);
    
    // Find recipes by ingredient ID
    @Query("SELECT DISTINCT r FROM Recipe r " +
           "JOIN r.recipeIngredients ri " +
           "WHERE ri.ingredient.id = :ingredientId")
    List<Recipe> findByIngredientId(@Param("ingredientId") Long ingredientId);
    
    // Advanced search with multiple criteria
    @Query("SELECT DISTINCT r FROM Recipe r " +
           "WHERE (:title IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:maxCookingTime IS NULL OR r.cookingTimeMinutes <= :maxCookingTime) " +
           "AND (:minServings IS NULL OR r.servings >= :minServings) " +
           "AND (:maxServings IS NULL OR r.servings <= :maxServings)")
    List<Recipe> searchRecipes(@Param("title") String title,
                               @Param("maxCookingTime") Integer maxCookingTime,
                               @Param("minServings") Integer minServings,
                               @Param("maxServings") Integer maxServings);
    
    // Find recipes that contain ALL specified ingredients
    @Query("SELECT r FROM Recipe r " +
           "WHERE :ingredientCount = (" +
           "  SELECT COUNT(DISTINCT ri.ingredient.id) " +
           "  FROM RecipeIngredient ri " +
           "  WHERE ri.recipe = r " +
           "  AND ri.ingredient.id IN :ingredientIds)")
    List<Recipe> findByAllIngredients(@Param("ingredientIds") List<Long> ingredientIds,
                                      @Param("ingredientCount") Long ingredientCount);
}