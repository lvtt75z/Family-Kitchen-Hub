package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipePopularity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipePopularityRepository extends JpaRepository<RecipePopularity, Long> {
    Optional<RecipePopularity> findByRecipe(Recipe recipe);
}

