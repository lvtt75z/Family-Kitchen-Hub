package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.RecipeIngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecipeIngredientService {

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    public List<RecipeIngredient> getIngredientsByRecipeId(Long recipeId) {
        return recipeIngredientRepository.findByRecipeId(recipeId);
    }

    @Transactional
    public RecipeIngredient addIngredient(Long recipeId, Long ingredientId, Double quantity, String unit) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found with id: " + ingredientId));

        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipe(recipe);
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(quantity);
        recipeIngredient.setUnit(unit);

        return recipeIngredientRepository.save(recipeIngredient);
    }

    @Transactional
    public RecipeIngredient updateIngredient(Long recipeIngredientId, Long ingredientId, Double quantity, String unit) {
        RecipeIngredient recipeIngredient = recipeIngredientRepository.findById(recipeIngredientId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "RecipeIngredient not found with id: " + recipeIngredientId));

        // Update ingredient reference if provided and different
        if (ingredientId != null && !ingredientId.equals(recipeIngredient.getIngredient().getId())) {
            Ingredient ingredient = ingredientRepository.findById(ingredientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found with id: " + ingredientId));
            recipeIngredient.setIngredient(ingredient);
        }

        if (quantity != null) {
            recipeIngredient.setQuantity(quantity);
        }
        if (unit != null) {
            recipeIngredient.setUnit(unit);
        }

        return recipeIngredientRepository.save(recipeIngredient);
    }

    @Transactional
    public void deleteIngredient(Long ingredientId) {
        RecipeIngredient recipeIngredient = recipeIngredientRepository.findById(ingredientId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("RecipeIngredient not found with id: " + ingredientId));
        recipeIngredientRepository.delete(recipeIngredient);
    }
}
