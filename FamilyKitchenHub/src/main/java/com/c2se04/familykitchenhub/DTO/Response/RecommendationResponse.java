package com.c2se04.familykitchenhub.DTO.Response;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RecommendationResponse {
    private List<RecommendationItem> recommendations;

    public List<RecommendationItem> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationItem> recommendations) {
        this.recommendations = recommendations;
    }

    // Class con (Inner Class) để hứng từng mục gợi ý
    public static class RecommendationItem {
        @JsonProperty("recipe_id")
        private Long recipeId;

        private double score;

        public Long getRecipeId() { return recipeId; }
        public void setRecipeId(Long recipeId) { this.recipeId = recipeId; }

        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
    }
}

