package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.RecipeImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeImageRepository extends JpaRepository<RecipeImage, Long> {
    
    List<RecipeImage> findByRecipeIdOrderByDisplayOrderAsc(Long recipeId);
    
    void deleteByRecipeId(Long recipeId);
}

