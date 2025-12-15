package com.c2se04.familykitchenhub.DTO.Response;

import java.util.List;

public class CookRecipeResponseDTO {
    private String message;
    private Long recipeId;
    private String recipeTitle;
    private List<DeductedIngredientDTO> deductedIngredients;

    public CookRecipeResponseDTO() {
    }

    public CookRecipeResponseDTO(String message, Long recipeId, String recipeTitle, List<DeductedIngredientDTO> deductedIngredients) {
        this.message = message;
        this.recipeId = recipeId;
        this.recipeTitle = recipeTitle;
        this.deductedIngredients = deductedIngredients;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getRecipeTitle() {
        return recipeTitle;
    }

    public void setRecipeTitle(String recipeTitle) {
        this.recipeTitle = recipeTitle;
    }

    public List<DeductedIngredientDTO> getDeductedIngredients() {
        return deductedIngredients;
    }

    public void setDeductedIngredients(List<DeductedIngredientDTO> deductedIngredients) {
        this.deductedIngredients = deductedIngredients;
    }

    public static class DeductedIngredientDTO {
        private Long ingredientId;
        private String ingredientName;
        private Double deductedQuantity;
        private Double remainingQuantity;
        private String unit;
        private boolean removedFromInventory; // true nếu đã hết và bị xóa khỏi inventory

        public DeductedIngredientDTO() {
        }

        public DeductedIngredientDTO(Long ingredientId, String ingredientName, Double deductedQuantity, Double remainingQuantity, String unit, boolean removedFromInventory) {
            this.ingredientId = ingredientId;
            this.ingredientName = ingredientName;
            this.deductedQuantity = deductedQuantity;
            this.remainingQuantity = remainingQuantity;
            this.unit = unit;
            this.removedFromInventory = removedFromInventory;
        }

        // Getters and Setters
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

        public Double getDeductedQuantity() {
            return deductedQuantity;
        }

        public void setDeductedQuantity(Double deductedQuantity) {
            this.deductedQuantity = deductedQuantity;
        }

        public Double getRemainingQuantity() {
            return remainingQuantity;
        }

        public void setRemainingQuantity(Double remainingQuantity) {
            this.remainingQuantity = remainingQuantity;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public boolean isRemovedFromInventory() {
            return removedFromInventory;
        }

        public void setRemovedFromInventory(boolean removedFromInventory) {
            this.removedFromInventory = removedFromInventory;
        }
    }
}

