package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;

@Entity
@Table(name = "recipe_category_map", indexes = {
    @Index(name = "idx_category", columnList = "category_id")
})
@IdClass(RecipeCategoryMapId.class)
public class RecipeCategoryMap {
    
    @Id
    @Column(name = "recipe_id")
    private Long recipeId;

    @Id
    @Column(name = "category_id")
    private Long categoryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", insertable = false, updatable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private RecipeCategory category;

    // Constructors
    public RecipeCategoryMap() {}

    public RecipeCategoryMap(Long recipeId, Long categoryId) {
        this.recipeId = recipeId;
        this.categoryId = categoryId;
    }

    // Getters and Setters
    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public RecipeCategory getCategory() {
        return category;
    }

    public void setCategory(RecipeCategory category) {
        this.category = category;
    }
}







