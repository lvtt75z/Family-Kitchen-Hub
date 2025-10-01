package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;

/**
 * Represents the 'recipe_ingredients' junction table.
 * It links a Recipe to an Ingredient and specifies the required quantity.
 */
@Entity
@Table(name = "recipe_ingredients")
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id")
    private Ingredient ingredient;

    @Column(name = "quantity_required")
    private Float quantityRequired;

    // --- Constructors, Getters, and Setters ---

    public RecipeIngredient() {
    }

    // (Thêm getters và setters ở đây)
}
