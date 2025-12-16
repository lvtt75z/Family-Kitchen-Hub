package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.enums.DifficultyLevel;
import com.c2se04.familykitchenhub.enums.MealType;
import java.util.List;
import java.util.Set;

public class RecipeResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String instructions;
    private Integer cookingTimeMinutes;
    private Integer servings;
    private Integer totalCalories;
    private String imageUrl;
    private List<String> imageUrls; // Multiple images
    private DifficultyLevel difficultyLevel;
    private MealType mealType;
    private Set<RecipeIngredientResponseDTO> ingredients;

    public RecipeResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Integer getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(Integer totalCalories) {
        this.totalCalories = totalCalories;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public MealType getMealType() {
        return mealType;
    }

    public void setMealType(MealType mealType) {
        this.mealType = mealType;
    }

    public Set<RecipeIngredientResponseDTO> getIngredients() {
        return ingredients;
    }

    public void setIngredients(Set<RecipeIngredientResponseDTO> ingredients) {
        this.ingredients = ingredients;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
