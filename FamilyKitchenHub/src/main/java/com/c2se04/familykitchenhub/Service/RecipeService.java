package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Repository.*;
import com.c2se04.familykitchenhub.enums.MealType;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import com.c2se04.familykitchenhub.model.RecipeImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final RecipeMapper recipeMapper;
    private final RecipeSearchLogRepository recipeSearchLogRepository;
    private final RecipeCommentRepository recipeCommentRepository;
    private final RecipeBookmarkRepository recipeBookmarkRepository;
    private final RecipePopularityRepository recipePopularityRepository;
    private final RecipeScheduleRepository recipeScheduleRepository;
    private final UserRecipeReminderRepository userRecipeReminderRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeImageRepository recipeImageRepository;
    private final InventoryItemRepository inventoryItemRepository;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository,
            IngredientRepository ingredientRepository,
            RecipeMapper recipeMapper,
            RecipeSearchLogRepository recipeSearchLogRepository,
            RecipeCommentRepository recipeCommentRepository,
            RecipeBookmarkRepository recipeBookmarkRepository,
            RecipePopularityRepository recipePopularityRepository,
            RecipeScheduleRepository recipeScheduleRepository,
            UserRecipeReminderRepository userRecipeReminderRepository,
            MealPlanEntryRepository mealPlanEntryRepository,
            RecipeImageRepository recipeImageRepository,
            InventoryItemRepository inventoryItemRepository) {
        this.recipeRepository = recipeRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeMapper = recipeMapper;
        this.recipeSearchLogRepository = recipeSearchLogRepository;
        this.recipeCommentRepository = recipeCommentRepository;
        this.recipeBookmarkRepository = recipeBookmarkRepository;
        this.recipePopularityRepository = recipePopularityRepository;
        this.recipeScheduleRepository = recipeScheduleRepository;
        this.userRecipeReminderRepository = userRecipeReminderRepository;
        this.mealPlanEntryRepository = mealPlanEntryRepository;
        this.recipeImageRepository = recipeImageRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Transactional
    public Recipe createRecipe(Recipe recipe) {
        if (recipe.getRecipeIngredients() != null) {
            for (RecipeIngredient recipeIngredient : recipe.getRecipeIngredients()) {
                if (recipeIngredient.getIngredient() == null || recipeIngredient.getIngredient().getId() == null) {
                    throw new ResourceNotFoundException("Ingredient", "id", null);
                }
                Ingredient ingredient = ingredientRepository.findById(recipeIngredient.getIngredient().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id",
                                recipeIngredient.getIngredient().getId()));
                recipeIngredient.setIngredient(ingredient);
                recipeIngredient.setRecipe(recipe);
                if (recipeIngredient.getUnit() == null || recipeIngredient.getUnit().trim().isEmpty()) {
                    recipeIngredient.setUnit(ingredient.getUnit() != null ? ingredient.getUnit() : "gram");
                }
            }
        }
        return recipeRepository.save(recipe);
    }

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public Optional<Recipe> getRecipeById(Long id) {
        return recipeRepository.findById(id);
    }

    public List<Recipe> getRecipesByMealType(MealType mealType) {
        return recipeRepository.findByMealType(mealType);
    }

    public List<Recipe> searchRecipesByTitle(String title) {
        return recipeRepository.findByTitleContainingIgnoreCase(title);
    }

    @Transactional
    public Recipe updateRecipe(Long id, Recipe updatedRecipeDetails) {
        Recipe existingRecipe = recipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", id));

        // Update basic fields only if provided
        if (updatedRecipeDetails.getTitle() != null) {
            existingRecipe.setTitle(updatedRecipeDetails.getTitle());
        }
        if (updatedRecipeDetails.getInstructions() != null) {
            existingRecipe.setInstructions(updatedRecipeDetails.getInstructions());
        }
        if (updatedRecipeDetails.getCookingTimeMinutes() != null) {
            existingRecipe.setCookingTimeMinutes(updatedRecipeDetails.getCookingTimeMinutes());
        }
        if (updatedRecipeDetails.getServings() != null) {
            existingRecipe.setServings(updatedRecipeDetails.getServings());
        }
        if (updatedRecipeDetails.getImageUrl() != null) {
            existingRecipe.setImageUrl(updatedRecipeDetails.getImageUrl());
        }
        if (updatedRecipeDetails.getMealType() != null) {
            existingRecipe.setMealType(updatedRecipeDetails.getMealType());
        }
        if (updatedRecipeDetails.getDescription() != null) {
            existingRecipe.setDescription(updatedRecipeDetails.getDescription());
        }
        if (updatedRecipeDetails.getTotalCalories() != null) {
            existingRecipe.setTotalCalories(updatedRecipeDetails.getTotalCalories());
        }
        if (updatedRecipeDetails.getDifficultyLevel() != null) {
            existingRecipe.setDifficultyLevel(updatedRecipeDetails.getDifficultyLevel());
        }

        if (updatedRecipeDetails.getRecipeIngredients() != null) {
            if (existingRecipe.getRecipeIngredients() != null) {
                existingRecipe.getRecipeIngredients().clear();
            }
            for (RecipeIngredient newIngredient : updatedRecipeDetails.getRecipeIngredients()) {
                if (newIngredient.getIngredient() == null || newIngredient.getIngredient().getId() == null) {
                    throw new ResourceNotFoundException("Ingredient", "id", null);
                }
                Ingredient ingredient = ingredientRepository.findById(newIngredient.getIngredient().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id",
                                newIngredient.getIngredient().getId()));
                newIngredient.setRecipe(existingRecipe);
                newIngredient.setIngredient(ingredient);
                if (newIngredient.getUnit() == null || newIngredient.getUnit().trim().isEmpty()) {
                    newIngredient.setUnit(ingredient.getUnit() != null ? ingredient.getUnit() : "gram");
                }
                existingRecipe.getRecipeIngredients().add(newIngredient);
            }
        }

        return recipeRepository.save(existingRecipe);
    }

    @Transactional
    public void deleteRecipe(Long id) {
        if (!recipeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Recipe", "id", id);
        }

        // Get the recipe to clear ManyToMany relationships
        Recipe recipe = recipeRepository.findById(id).get();

        // Clear ManyToMany categories relationship (recipe_categories table)
        recipe.getCategories().clear();
        recipeRepository.save(recipe);

        // Delete from other tables
        recipeCommentRepository.deleteByRecipeId(id);
        recipeBookmarkRepository.deleteByRecipeId(id);
        recipePopularityRepository.deleteByRecipeId(id);
        recipeSearchLogRepository.deleteByRecipeId(id);
        recipeScheduleRepository.deleteByRecipeId(id);
        userRecipeReminderRepository.deleteByRecipeId(id);
        mealPlanEntryRepository.deleteByRecipeId(id);

        // Delete recipe images
        recipeImageRepository.deleteByRecipeId(id);

        // Then delete the recipe (recipeIngredients and steps will cascade via JPA
        // CascadeType.ALL)
        recipeRepository.deleteById(id);
    }

    /**
     * Add images to a recipe
     */
    @Transactional
    public List<RecipeImage> addImagesToRecipe(Long recipeId, List<String> imageUrls, List<String> fileNames) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        List<RecipeImage> images = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            RecipeImage image = new RecipeImage();
            image.setRecipe(recipe);
            image.setImageUrl(imageUrls.get(i));
            if (fileNames != null && i < fileNames.size()) {
                image.setFileName(fileNames.get(i));
            }
            image.setDisplayOrder(i);
            images.add(recipeImageRepository.save(image));
        }
        return images;
    }

    /**
     * Get all images for a recipe
     */
    public List<RecipeImage> getRecipeImages(Long recipeId) {
        return recipeImageRepository.findByRecipeIdOrderByDisplayOrderAsc(recipeId);
    }

    /**
     * Delete an image from a recipe
     */
    @Transactional
    public void deleteRecipeImage(Long imageId) {
        if (!recipeImageRepository.existsById(imageId)) {
            throw new ResourceNotFoundException("RecipeImage", "id", imageId);
        }
        recipeImageRepository.deleteById(imageId);
    }

    /**
     * Get recipes that can be cooked with available ingredients in user's fridge
     * Returns recipes where ALL required ingredients are available in sufficient
     * quantities
     */
    public List<Recipe> getCookableRecipes(Long userId) {
        System.out.println("=== Getting cookable recipes for userId: " + userId + " ===");
        List<Recipe> allRecipes = recipeRepository.findAll();
        List<com.c2se04.familykitchenhub.model.InventoryItem> inventoryItems = inventoryItemRepository
                .findByUserId(userId);

        System.out.println("Total recipes: " + allRecipes.size());
        System.out.println("User inventory items: " + inventoryItems.size());

        List<Recipe> cookableRecipes = new ArrayList<>();

        for (Recipe recipe : allRecipes) {
            boolean canCook = true;
            List<RecipeIngredient> requiredIngredients = new ArrayList<>(recipe.getRecipeIngredients());

            System.out.println("\nChecking recipe: " + recipe.getTitle() + " (ID: " + recipe.getId() + ")");
            System.out.println("  Required ingredients: " + requiredIngredients.size());

            if (requiredIngredients == null || requiredIngredients.isEmpty()) {
                System.out.println("  -> Recipe has no ingredients, SKIPPING");
                continue; // Skip recipes with no ingredients
            }
            for (RecipeIngredient required : requiredIngredients) {
                if (required.getIngredient() == null) {
                    System.out.println("  -> Ingredient is NULL, NOT COOKABLE");
                    canCook = false;
                    break;
                }

                Long requiredIngredientId = required.getIngredient().getId();
                String ingredientName = required.getIngredient().getName();
                Double requiredQuantity = required.getQuantity();

                System.out.println("  Checking: " + ingredientName + " (ID: " + requiredIngredientId + ")");
                System.out.println("    Required: " + requiredQuantity);

                if (requiredQuantity == null || requiredQuantity <= 0) {
                    boolean hasIngredient = inventoryItems.stream()
                            .anyMatch(item -> item.getIngredient() != null &&
                                    item.getIngredient().getId().equals(requiredIngredientId));
                    System.out.println("    Has ingredient in inventory: " + hasIngredient);
                    if (!hasIngredient) {
                        canCook = false;
                        break;
                    }
                    continue;
                }

                double availableQuantity = inventoryItems.stream()
                        .filter(item -> item.getIngredient() != null &&
                                item.getIngredient().getId().equals(requiredIngredientId))
                        .mapToDouble(item -> item.getQuantity() != null ? item.getQuantity() : 0.0)
                        .sum();

                System.out.println("    Available: " + availableQuantity);

                if (availableQuantity < requiredQuantity) {
                    System.out.println("    -> INSUFFICIENT, NOT COOKABLE");
                    canCook = false;
                    break;
                } else {
                    System.out.println("    -> SUFFICIENT");
                }
            }

            if (canCook) {
                System.out.println("  => Recipe is COOKABLE");
                cookableRecipes.add(recipe);
            } else {
                System.out.println("  => Recipe is NOT COOKABLE");
            }
        }

        System.out.println("\n=== Total cookable recipes: " + cookableRecipes.size() + " ===");
        return cookableRecipes;
    }

    /**
     * Get recipes bookmarked by a specific user
     */
    public List<Recipe> getBookmarkedRecipesByUser(Long userId) {
        List<com.c2se04.familykitchenhub.model.RecipeBookmark> bookmarks = recipeBookmarkRepository
                .findByUserId(userId);

        List<Recipe> bookmarkedRecipes = new ArrayList<>();
        for (com.c2se04.familykitchenhub.model.RecipeBookmark bookmark : bookmarks) {
            if (bookmark.getRecipe() != null) {
                bookmarkedRecipes.add(bookmark.getRecipe());
            }
        }

        return bookmarkedRecipes;
    }
}