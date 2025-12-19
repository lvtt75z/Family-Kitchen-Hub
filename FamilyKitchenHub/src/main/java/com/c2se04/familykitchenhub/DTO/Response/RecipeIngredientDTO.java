package com.c2se04.familykitchenhub.DTO.Response;

public class RecipeIngredientDTO {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private Double quantity;
    private String unit;

    // Constructors
    public RecipeIngredientDTO() {
    }

    public RecipeIngredientDTO(Long id, Long ingredientId, String ingredientName, Double quantity, String unit) {
        this.id = id;
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.quantity = quantity;
        this.unit = unit;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Long ingredientId) {
        this.ingredientId = ingredientId;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public Double getQuantity() {
        return quantity;
    }

    public void setQuantity(Double quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
