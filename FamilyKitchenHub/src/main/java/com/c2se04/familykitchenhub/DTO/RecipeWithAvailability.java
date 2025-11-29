package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.model.Recipe;

/**
 * DTO combining recipe with its ingredient availability
 */
public class RecipeWithAvailability {

    private Recipe recipe;
    private IngredientAvailability availability;

    public RecipeWithAvailability() {
    }

    public RecipeWithAvailability(Recipe recipe, IngredientAvailability availability) {
        this.recipe = recipe;
        this.availability = availability;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public IngredientAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(IngredientAvailability availability) {
        this.availability = availability;
    }
}
