package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.enums.CommentStatus;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeCommentRepository extends JpaRepository<RecipeComment, Long> {

    List<RecipeComment> findByRecipeOrderByCreatedAtDesc(Recipe recipe);

    List<RecipeComment> findByRecipeAndStatusOrderByCreatedAtDesc(Recipe recipe, CommentStatus status);

    void deleteByUser(User user);

    // Cascade deletion method for recipe deletion
    void deleteByRecipeId(Long recipeId);
}
