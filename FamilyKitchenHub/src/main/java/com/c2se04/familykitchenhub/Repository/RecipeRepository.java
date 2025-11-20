package com.c2se04.familykitchenhub.Repository;
import com.c2se04.familykitchenhub.enums.MealType;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Tìm kiếm công thức theo kiểu món ăn
    List<Recipe> findByMealType(MealType mealType);
    
    // Tìm kiếm công thức theo tên (không phân biệt hoa thường)
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Recipe> findByTitleContainingIgnoreCase(@Param("name") String name);
}