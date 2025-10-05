package com.c2se04.familykitchenhub.Repository;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Không cần code thêm
}