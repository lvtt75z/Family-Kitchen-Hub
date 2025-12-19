package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.enums.MealType;
import java.util.Set;

public class RecipeRequestDTO {
    private String title;
    private String instructions;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private MealType mealType;
    private Set<RecipeIngredientDTO> ingredients;

    public RecipeRequestDTO() {
    }

    public Set<RecipeIngredientDTO> getIngredients() {
        return ingredients;
    }

    public void setIngredients(Set<RecipeIngredientDTO> ingredients) {
        this.ingredients = ingredients;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Integer getCookingTimeMinutes() {
        return cookingTimeMinutes;
    }

    public void setCookingTimeMinutes(Integer cookingTimeMinutes) {
        this.cookingTimeMinutes = cookingTimeMinutes;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }
}
