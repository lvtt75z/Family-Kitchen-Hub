package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.RecipeSearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeSearchLogRepository extends JpaRepository<RecipeSearchLog, Long> {

    void deleteByUserId(Long userId);

    // Cascade deletion method for recipe deletion
    void deleteByRecipeId(Long recipeId);
}
