package com.c2se04.familykitchenhub.DTO;

public class RecipeIngredientDTO {
    private Long ingredientId;
    // Số lượng theo đơn vị cơ sở của Ingredient (ví dụ: gram)
    private Double quantity;
    // Đơn vị tính (optional - nếu không có sẽ lấy từ Ingredient.defaultUnit)
    private String unit;

    public RecipeIngredientDTO() {}

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
