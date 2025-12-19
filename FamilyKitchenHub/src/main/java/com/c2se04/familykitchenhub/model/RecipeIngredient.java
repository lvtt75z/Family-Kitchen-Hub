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

    // [GIỮ NGUYÊN] Tên cột và kiểu dữ liệu cũ
    @Column(name = "quantity_required")
    private Double quantity;

    // [MỚI] Thêm đơn vị tính
    @Column(name = "unit", nullable = false)
    private String unit;

    // [MỚI] Thêm cờ đánh dấu nguyên liệu chính (cho AI)
    @Column(name = "is_main_ingredient")
    private Boolean isMainIngredient = false;

    // --- Constructors, Getters, and Setters ---

    public RecipeIngredient() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    // --- Getter & Setter cho các trường MỚI ---

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Boolean getIsMainIngredient() {
        return isMainIngredient;
    }

    public void setIsMainIngredient(Boolean mainIngredient) {
        isMainIngredient = mainIngredient;
    }
}