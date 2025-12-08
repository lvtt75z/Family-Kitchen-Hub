package com.c2se04.familykitchenhub.DTO.Request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RecommendationRequest {

    @JsonProperty("current_date")
    private String currentDate;

    @JsonProperty("inventory_items")
    private List<InventoryItemDTO> inventoryItems;

    @JsonProperty("family_profiles")
    private List<FamilyProfileDTO> familyProfiles;

    @JsonProperty("all_recipes")
    private List<RecipeDTO> allRecipes;

    // --- Inner Static Classes (DTO con) ---

    @Data
    @Builder
    public static class InventoryItemDTO {
        @JsonProperty("ingredient_id")
        private Long ingredientId;
        private Float quantity;
        private String unit;
        @JsonProperty("expiry_date")
        private String expiryDate; // Format YYYY-MM-DD
    }

    @Data
    @Builder
    public static class FamilyProfileDTO {
        private Integer age;
        private String gender; // MALE/FEMALE
        @JsonProperty("height_cm")
        private Float heightCm;
        @JsonProperty("weight_kg")
        private Float weightKg;
        @JsonProperty("activity_level")
        private String activityLevel; // ACTIVE/SEDENTARY...
        private List<Long> allergies;
        @JsonProperty("taste_preferences")
        private List<String> tastePreferences; // Thay thế cho health_goals cũ
    }

    @Data
    @Builder
    public static class RecipeDTO {
        private Long id;
        @JsonProperty("total_calories")
        private Integer totalCalories;
        private List<String> categories; // List tên category
        private List<RecipeIngredientDTO> ingredients;
    }

    @Data
    @Builder
    public static class RecipeIngredientDTO {
        @JsonProperty("ingredient_id")
        private Long ingredientId;
        private Float quantity;
        @JsonProperty("is_main_ingredient")
        private Boolean isMainIngredient;
    }
}