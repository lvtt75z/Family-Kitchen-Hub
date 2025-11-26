package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.RecipeCategoryMap;
import com.c2se04.familykitchenhub.model.RecipeCategoryMapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeCategoryMapRepository extends JpaRepository<RecipeCategoryMap, RecipeCategoryMapId> {
    
    // Find categories for a recipe
    List<RecipeCategoryMap> findByRecipeId(Long recipeId);
    
    // Count categories for recipe
    long countByRecipeId(Long recipeId);
    
    // Delete all categories for recipe
    void deleteByRecipeId(Long recipeId);
    
    // Get recipe IDs by category
    @Query("SELECT rcm.recipeId FROM RecipeCategoryMap rcm WHERE rcm.categoryId = :categoryId")
    List<Long> findRecipeIdsByCategoryId(@Param("categoryId") Long categoryId);
}







