package com.c2se04.familykitchenhub.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeCategoryRepository extends JpaRepository<RecipeCategory, Long> {
    
    // Find root categories (no parent)
    List<RecipeCategory> findByParentIsNull();
}







