package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.CategoryDTO;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.CategoryRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.model.Category;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    /**
     * Get all categories (flat list, simple DTO)
     */
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getDescription()))
                .collect(Collectors.toList());
    }

    /**
     * Get categories for a recipe (simple DTO)
     */
    @Transactional(readOnly = true)
    public List<CategoryDTO> getCategoriesForRecipe(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        return recipe.getCategories().stream()
                .map(cat -> new CategoryDTO(cat.getId(), cat.getName(), cat.getDescription()))
                .collect(Collectors.toList());
    }

    /**
     * Set categories for recipe (replace all)
     */
    @Transactional
    public void setRecipeCategories(Long recipeId, List<Long> categoryIds) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        // Validation: at least 1 category
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new BadRequestException("Recipe must have at least 1 category");
        }

        // Verify all categories exist and fetch them
        Set<Category> categories = categoryIds.stream()
                .map(categoryId -> categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId)))
                .collect(Collectors.toSet());

        // Clear existing categories and set new ones
        recipe.getCategories().clear();
        recipe.getCategories().addAll(categories);

        // Flush to ensure immediate persistence
        recipeRepository.saveAndFlush(recipe);
    }

    /**
     * Add a single category to a recipe
     */
    @Transactional
    public void addCategoryToRecipe(Long recipeId, Long categoryId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        recipe.getCategories().add(category);
        recipeRepository.save(recipe);
    }

    /**
     * Remove a category from a recipe
     */
    @Transactional
    public void removeCategoryFromRecipe(Long recipeId, Long categoryId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        recipe.getCategories().remove(category);
        recipeRepository.save(recipe);
    }

    /**
     * Get recipe IDs by category
     */
    public List<Long> getRecipeIdsByCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        return category.getRecipes().stream()
                .map(Recipe::getId)
                .collect(Collectors.toList());
    }

    /**
     * Validate recipe has categories before publish
     */
    public void validateRecipeHasCategories(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        if (recipe.getCategories().isEmpty()) {
            throw new BadRequestException("Recipe must have at least 1 category before publishing");
        }
    }

    /**
     * Get a category by ID
     */
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    /**
     * Create a new category
     */
    @Transactional
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new BadRequestException("Category with name '" + category.getName() + "' already exists");
        }
        return categoryRepository.save(category);
    }

    /**
     * Update a category
     */
    @Transactional
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!category.getName().equals(categoryDetails.getName())
                && categoryRepository.existsByName(categoryDetails.getName())) {
            throw new BadRequestException("Category with name '" + categoryDetails.getName() + "' already exists");
        }

        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        return categoryRepository.save(category);
    }

    /**
     * Delete a category
     */
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Remove category from all recipes first
        for (Recipe recipe : category.getRecipes()) {
            recipe.getCategories().remove(category);
        }

        categoryRepository.delete(category);
    }
}