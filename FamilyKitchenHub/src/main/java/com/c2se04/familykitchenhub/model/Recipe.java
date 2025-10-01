package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;
import java.util.Set;

/**
 * Represents the 'recipes' table.
 */
@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "cooking_time_minutes")
    private Integer cookingTimeMinutes;

    @Column(name = "servings")
    private Integer servings;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<RecipeIngredient> recipeIngredients;

    // --- Constructors, Getters, and Setters ---

    public Recipe() {
    }

    // (Thêm getters và setters ở đây)
}