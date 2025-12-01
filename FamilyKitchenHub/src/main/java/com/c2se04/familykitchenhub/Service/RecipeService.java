package com.c2se04.familykitchenhub.Service;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.enums.MealType;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeMapper recipeMapper;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository, IngredientRepository ingredientRepository, RecipeMapper recipeMapper) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeMapper = recipeMapper;
    }
    // CREATE
    @Transactional
    public Recipe createRecipe(Recipe recipe) {
        if (recipe.getRecipeIngredients() != null) {
            for (RecipeIngredient recipeIngredient : recipe.getRecipeIngredients()) {
                if (recipeIngredient.getIngredient() == null || recipeIngredient.getIngredient().getId() == null) {
                    throw new ResourceNotFoundException("Ingredient", "id", null);
                }
                Ingredient ingredient = ingredientRepository.findById(recipeIngredient.getIngredient().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", recipeIngredient.getIngredient().getId()));
                recipeIngredient.setIngredient(ingredient);
                recipeIngredient.setRecipe(recipe);
                // Nếu unit chưa được set, lấy từ Ingredient.defaultUnit
                if (recipeIngredient.getUnit() == null || recipeIngredient.getUnit().trim().isEmpty()) {
                    recipeIngredient.setUnit(ingredient.getUnit() != null ? ingredient.getUnit() : "gram");
                }
            }
        }
        return recipeRepository.save(recipe);
    }

    // READ ALL
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    // READ BY ID
    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    // READ BY MEAL TYPE
    public List<Recipe> getRecipesByMealType(MealType mealType) {
        return recipeRepository.findByMealType(mealType);
    }

    // READ BY TITLE (SEARCH)
    public List<Recipe> searchRecipesByTitle(String title) {
        return recipeRepository.findByTitleContainingIgnoreCase(title);
    }

    // UPDATE
    @Transactional
    public Recipe updateRecipe(Long id, Recipe updatedRecipeDetails) {
        // Tìm kiếm và ném Custom Exception nếu không tìm thấy
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        // Cập nhật các trường dữ liệu
        existingRecipe.setTitle(updatedRecipeDetails.getTitle());
        existingRecipe.setInstructions(updatedRecipeDetails.getInstructions());
        existingRecipe.setCookingTimeMinutes(updatedRecipeDetails.getCookingTimeMinutes());
        existingRecipe.setServings(updatedRecipeDetails.getServings());
        existingRecipe.setImageUrl(updatedRecipeDetails.getImageUrl());
        existingRecipe.setMealType(updatedRecipeDetails.getMealType());

        // Cập nhật danh sách thành phần nếu có
        if (updatedRecipeDetails.getRecipeIngredients() != null) {
            if (existingRecipe.getRecipeIngredients() != null) {
                existingRecipe.getRecipeIngredients().clear();
            }
            for (RecipeIngredient newIngredient : updatedRecipeDetails.getRecipeIngredients()) {
                if (newIngredient.getIngredient() == null || newIngredient.getIngredient().getId() == null) {
                    throw new ResourceNotFoundException("Ingredient", "id", null);
                }
                Ingredient ingredient = ingredientRepository.findById(newIngredient.getIngredient().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", newIngredient.getIngredient().getId()));
                newIngredient.setRecipe(existingRecipe);
                newIngredient.setIngredient(ingredient);
                // Nếu unit chưa được set, lấy từ Ingredient.defaultUnit
                if (newIngredient.getUnit() == null || newIngredient.getUnit().trim().isEmpty()) {
                    newIngredient.setUnit(ingredient.getUnit() != null ? ingredient.getUnit() : "gram");
                }
                existingRecipe.getRecipeIngredients().add(newIngredient);
            }
        }

        return recipeRepository.save(existingRecipe);
    }

    // DELETE
    @Transactional
    public void deleteRecipe(Long id) {
        // Kiểm tra sự tồn tại và ném Custom Exception nếu không tìm thấy
        if (!recipeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recipe", "id", id);
        }
        recipeRepository.deleteById(id);
    }
}
