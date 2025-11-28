package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeBookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecipeBookmarkRepository extends JpaRepository<RecipeBookmark, Long> {

    boolean existsByUserAndRecipe(User user, Recipe recipe);

    Optional<RecipeBookmark> findByUserAndRecipe(User user, Recipe recipe);
}

