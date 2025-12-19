package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.CategoryDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Service.CategoryService;
import com.c2se04.familykitchenhub.Service.RecipeService;
import com.c2se04.familykitchenhub.model.Category;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private RecipeService recipeService;

    @Autowired
    private RecipeMapper recipeMapper;

    /**
     * GET /api/categories
     * Get all categories (simple flat list)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/categories/{id}
     * Get a single category by ID (simple DTO)
     */
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        CategoryDTO dto = new CategoryDTO(category.getId(), category.getName(), category.getDescription());
        return ResponseEntity.ok(dto);
    }

    /**
     * POST /api/categories
     * Create a new category
     */
    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        Category created = categoryService.createCategory(category);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * PUT /api/categories/{id}
     * Update a category
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        Category updated = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/categories/{id}
     * Delete a category
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/categories/{id}/recipes
     * Get all recipes in a category
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