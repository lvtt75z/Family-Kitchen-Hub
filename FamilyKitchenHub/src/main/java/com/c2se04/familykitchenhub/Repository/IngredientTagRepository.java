package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.IngredientTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientTagRepository extends JpaRepository<IngredientTag, Long> {

    // Find all tags for an ingredient
    List<IngredientTag> findByIngredientId(Long ingredientId);

    // Find specific ingredient-tag pair
    Optional<IngredientTag> findByIngredientIdAndTagId(Long ingredientId, Long tagId);

    // Delete by ingredient and tag
    void deleteByIngredientIdAndTagId(Long ingredientId, Long tagId);

    // Check if ingredient has tag
    boolean existsByIngredientIdAndTagId(Long ingredientId, Long tagId);

    // Count tags for ingredient
    long countByIngredientId(Long ingredientId);

    // Get ingredients by tag
    @Query("SELECT it FROM IngredientTag it WHERE it.tag.id = :tagId")
    List<IngredientTag> findByTagId(@Param("tagId") Long tagId);

    // Cascade deletion methods
    void deleteByTagId(Long tagId);

    void deleteByIngredientId(Long ingredientId);
}
