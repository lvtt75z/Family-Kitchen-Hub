package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
}

