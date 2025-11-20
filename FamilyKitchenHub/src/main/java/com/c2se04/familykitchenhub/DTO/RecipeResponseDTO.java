package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.enums.MealType;
import java.util.Set;

public class RecipeResponseDTO {
    private Long id;
    private String title;
    private String instructions;   // ✅ thêm vào để đầy đủ dữ liệu
    private Integer cookingTimeMinutes;
    private Integer servings;
    private String imageUrl;
    private MealType mealType;
    private Set<RecipeIngredientResponseDTO> ingredients;

    public RecipeResponseDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }

    public Integer getCookingTimeMinutes() { return cookingTimeMinutes; }
    public void setCookingTimeMinutes(Integer cookingTimeMinutes) { this.cookingTimeMinutes = cookingTimeMinutes; }

    public Integer getServings() { return servings; }
    public void setServings(Integer servings) { this.servings = servings; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public MealType getMealType() { return mealType; }
    public void setMealType(MealType mealType) { this.mealType = mealType; }

    public Set<RecipeIngredientResponseDTO> getIngredients() { return ingredients; }
    public void setIngredients(Set<RecipeIngredientResponseDTO> ingredients) { this.ingredients = ingredients; }
}
