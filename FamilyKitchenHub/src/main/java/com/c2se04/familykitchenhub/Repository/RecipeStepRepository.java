package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {
    List<RecipeStep> findByRecipeIdOrderByStepOrderAsc(Long recipeId);
}
