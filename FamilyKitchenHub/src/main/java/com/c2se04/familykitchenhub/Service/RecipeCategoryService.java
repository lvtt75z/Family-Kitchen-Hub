package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.CategoryTreeDTO;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.RecipeCategoryMapRepository;
import com.c2se04.familykitchenhub.Repository.RecipeCategoryRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeCategoryService {

    @Autowired
    private RecipeCategoryRepository categoryRepository;

    @Autowired
    private RecipeCategoryMapRepository categoryMapRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    /**
     * Get all categories as tree structure for FE filter
     */
    public List<CategoryTreeDTO> getCategoryTree() {
        List<RecipeCategory> rootCategories = categoryRepository.findByParentIsNull();
        return rootCategories.stream()
                .map(this::buildTree)
                .collect(Collectors.toList());
    }

    /**
     * Recursively build category tree
     */
    private CategoryTreeDTO buildTree(RecipeCategory category) {
        CategoryTreeDTO dto = new CategoryTreeDTO(
            category.getId(),
            category.getName(),
            category.getParent() != null ? category.getParent().getId() : null
        );
        
        if (!category.getChildren().isEmpty()) {
            List<CategoryTreeDTO> children = category.getChildren().stream()
                    .map(this::buildTree)
                    .collect(Collectors.toList());
            dto.setChildren(children);
        }
        
        return dto;
    }

    /**
     * Get categories for a recipe
     */
    public List<CategoryTreeDTO> getCategoriesForRecipe(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        List<RecipeCategoryMap> maps = categoryMapRepository.findByRecipeId(recipeId);
        
        return maps.stream()
                .map(map -> {
                    RecipeCategory cat = categoryRepository.findById(map.getCategoryId()).orElse(null);
                    if (cat != null) {
                        return new CategoryTreeDTO(cat.getId(), cat.getName(), 
                            cat.getParent() != null ? cat.getParent().getId() : null);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    /**
     * Set categories for recipe (replace all)
     */
    @Transactional
    public void setRecipeCategories(Long recipeId, List<Long> categoryIds) {
        if (!recipeRepository.existsById(recipeId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        // Validation: at least 1 category
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw new BadRequestException("Recipe must have at least 1 category");
        }

        // Verify all categories exist
        for (Long categoryId : categoryIds) {
            if (!categoryRepository.existsById(categoryId)) {
                throw new ResourceNotFoundException("Category not found with id: " + categoryId);
            }
        }

        // Delete existing mappings
        categoryMapRepository.deleteByRecipeId(recipeId);

        // Add new mappings
        for (Long categoryId : categoryIds) {
            RecipeCategoryMap map = new RecipeCategoryMap(recipeId, categoryId);
            categoryMapRepository.save(map);
        }
    }

    /**
     * Get recipe IDs by category
     */
    public List<Long> getRecipeIdsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        
        return categoryMapRepository.findRecipeIdsByCategoryId(categoryId);
    }

    /**
     * Validate recipe has categories before publish
     */
    public void validateRecipeHasCategories(Long recipeId) {
        long count = categoryMapRepository.countByRecipeId(recipeId);
        if (count == 0) {
            throw new BadRequestException("Recipe must have at least 1 category before publishing");
        }
    }
}







