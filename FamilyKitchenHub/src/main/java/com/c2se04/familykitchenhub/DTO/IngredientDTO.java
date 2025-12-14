package com.c2se04.familykitchenhub.DTO;

/**
 * DTO dùng để tạo mới hoặc cập nhật Ingredient.
 */
public class IngredientDTO {

    private String name;
    private String unit;
    private Integer caloriesPer100g; // Calories per 100g
    private String nutritionalInfo; // Thêm trường thông tin dinh dưỡng

    // --- Getters và Setters ---

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Integer getCaloriesPer100g() {
        return caloriesPer100g;
    }

    public void setCaloriesPer100g(Integer caloriesPer100g) {
        this.caloriesPer100g = caloriesPer100g;
    }

    public String getNutritionalInfo() {
        return nutritionalInfo;
    }

    public void setNutritionalInfo(String nutritionalInfo) {
        this.nutritionalInfo = nutritionalInfo;
    }
}