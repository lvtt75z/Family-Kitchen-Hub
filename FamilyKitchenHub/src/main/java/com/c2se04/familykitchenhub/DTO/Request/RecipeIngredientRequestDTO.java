package com.c2se04.familykitchenhub.DTO.Request;

public class RecipeIngredientRequestDTO {
    private Long ingredientId;
    private Double quantity;
    private String unit;

    // Constructors
    public RecipeIngredientRequestDTO() {
    }

    public RecipeIngredientRequestDTO(Long ingredientId, Double quantity, String unit) {
        this.ingredientId = ingredientId;
        this.quantity = quantity;
        this.unit = unit;
    }

    // Getters and Setters
    public Long getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Long ingredientId) {
        this.ingredientId = ingredientId;
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
