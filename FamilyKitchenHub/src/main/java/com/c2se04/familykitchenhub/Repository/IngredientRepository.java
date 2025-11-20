package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    /**
     * Tìm kiếm nguyên liệu theo tên (không phân biệt hoa thường, hỗ trợ partial match).
     */
    java.util.List<Ingredient> findByNameContainingIgnoreCase(String keyword);
}

