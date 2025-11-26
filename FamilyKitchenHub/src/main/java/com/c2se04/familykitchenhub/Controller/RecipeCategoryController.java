package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.CategoryTreeDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Service.RecipeCategoryService;
import com.c2se04.familykitchenhub.Service.RecipeService;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class RecipeCategoryController {

    @Autowired
    private RecipeCategoryService categoryService;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private RecipeMapper recipeMapper;

    /**
     * GET /api/recipe-categories
     * Get all categories as tree structure for FE to build filter
     * MATCHES YOUR DOCUMENT ✅
     */
    @GetMapping("/recipe-categories")
    public ResponseEntity<List<CategoryTreeDTO>> getCategoryTree() {
        List<CategoryTreeDTO> tree = categoryService.getCategoryTree();
        return ResponseEntity.ok(tree);
    }

    /**
     * GET /api/categories/{id}/recipes
     * Get all recipes in a category
     * Browse by category feature
     */
    @GetMapping("/categories/{id}/recipes")
    public ResponseEntity<List<RecipeResponseDTO>> getRecipesByCategory(@PathVariable Long id) {
        List<Long> recipeIds = categoryService.getRecipeIdsByCategory(id);
        
        List<Recipe> recipes = recipeIds.stream()
                .map(recipeId -> recipeService.getRecipeById(recipeId).orElse(null))
                .filter(recipe -> recipe != null)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(recipeMapper.toResponseDTOList(recipes));
    }
}




