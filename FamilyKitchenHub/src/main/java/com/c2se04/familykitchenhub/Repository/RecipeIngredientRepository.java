package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {
    
    /**
     * Find all ingredients for a recipe
     */
    List<RecipeIngredient> findByRecipeId(Long recipeId);
    
    /**
     * Find all recipes that use a specific ingredient
     */
    @Query("SELECT ri FROM RecipeIngredient ri WHERE ri.ingredient.id = :ingredientId")
    List<RecipeIngredient> findByIngredientId(@Param("ingredientId") Long ingredientId);
    
    /**
     * Count ingredients for a recipe
     */
    long countByRecipeId(Long recipeId);
    
    /**
     * Delete all ingredients for a recipe
     */
    void deleteByRecipeId(Long recipeId);
}







