package com.c2se04.familykitchenhub.Service;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
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

    // SEARCH BY TITLE
    public List<Recipe> searchRecipesByTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            return recipeRepository.findAll();
        }
        return recipeRepository.findByTitleContainingIgnoreCase(title.trim());
    }

    // FILTER BY MAX COOKING TIME
    public List<Recipe> filterByMaxCookingTime(Integer maxMinutes) {
        if (maxMinutes == null || maxMinutes <= 0) {
            return recipeRepository.findAll();
        }
        return recipeRepository.findByCookingTimeMinutesLessThanEqual(maxMinutes);
    }

    // FILTER BY SERVINGS
    public List<Recipe> filterByServings(Integer servings) {
        if (servings == null || servings <= 0) {
            return recipeRepository.findAll();
        }
        return recipeRepository.findByServings(servings);
    }

    // FILTER BY SERVINGS RANGE
    public List<Recipe> filterByServingsRange(Integer minServings, Integer maxServings) {
        if (minServings == null) minServings = 0;
        if (maxServings == null) maxServings = Integer.MAX_VALUE;
        return recipeRepository.findByServingsBetween(minServings, maxServings);
    }

    // SEARCH BY INGREDIENT NAME
    public List<Recipe> searchByIngredientName(String ingredientName) {
        if (ingredientName == null || ingredientName.trim().isEmpty()) {
            return recipeRepository.findAll();
        }
        return recipeRepository.findByIngredientName(ingredientName.trim());
    }

    // SEARCH BY INGREDIENT ID
    public List<Recipe> searchByIngredientId(Long ingredientId) {
        if (ingredientId == null) {
            return recipeRepository.findAll();
        }
        // Validate ingredient exists
        if (!ingredientRepository.existsById(ingredientId)) {
            throw new ResourceNotFoundException("Ingredient", "id", ingredientId);
        }
        return recipeRepository.findByIngredientId(ingredientId);
    }

    // ADVANCED SEARCH WITH MULTIPLE FILTERS
    public List<Recipe> advancedSearch(String title, Integer maxCookingTime, 
                                      Integer minServings, Integer maxServings) {
        return recipeRepository.searchRecipes(
            (title != null && !title.trim().isEmpty()) ? title.trim() : null,
            maxCookingTime,
            minServings,
            maxServings
        );
    }

    // FIND RECIPES CONTAINING ALL SPECIFIED INGREDIENTS
    public List<Recipe> findRecipesWithAllIngredients(List<Long> ingredientIds) {
        if (ingredientIds == null || ingredientIds.isEmpty()) {
            return recipeRepository.findAll();
        }
        
        // Validate all ingredients exist
        for (Long ingredientId : ingredientIds) {
            if (!ingredientRepository.existsById(ingredientId)) {
                throw new ResourceNotFoundException("Ingredient", "id", ingredientId);
            }
        }
        
        return recipeRepository.findByAllIngredients(ingredientIds, (long) ingredientIds.size());
    }

    // QUICK RECIPES (30 minutes or less)
    public List<Recipe> getQuickRecipes() {
        return recipeRepository.findByCookingTimeMinutesLessThanEqual(30);
    }

    // RECIPES FOR GROUPS (6+ servings)
    public List<Recipe> getGroupRecipes() {
        return recipeRepository.findByServingsBetween(6, Integer.MAX_VALUE);
    }
}
