package com.c2se04.familykitchenhub.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class RecommendationResponse {

    private String status;

    @JsonProperty("family_tdee")
    private Integer familyTdee; // Tổng calo cả nhà cần

    @JsonProperty("target_meal_calories")
    private Integer targetMealCalories; // Mục tiêu calo cho bữa này

    private List<RecommendationItem> recommendations;

    @Data
    @NoArgsConstructor
    public static class RecommendationItem {
        @JsonProperty("recipe_id")
        private Long recipeId;

        private Double score;

        private Integer calories;

        @JsonProperty("match_nutrition")
        private Boolean matchNutrition;
    }
}