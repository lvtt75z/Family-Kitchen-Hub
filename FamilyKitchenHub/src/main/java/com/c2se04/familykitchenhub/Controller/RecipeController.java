package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.CategoryDTO;
import com.c2se04.familykitchenhub.DTO.RecipeRequestDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.DTO.Request.SetRecipeCategoriesDTO;
import com.c2se04.familykitchenhub.DTO.SimilarRecipeDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.enums.MealType;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.Service.CategoryService;
import com.c2se04.familykitchenhub.Service.RecipeRecommendationService;
import com.c2se04.familykitchenhub.Service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper; // Tiêm Mapper

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private RecipeRecommendationService recommendationService;

    @Autowired
    public RecipeController(RecipeService recipeService, RecipeMapper recipeMapper) {
        this.recipeService = recipeService;
        this.recipeMapper = recipeMapper;
    }

    // POST /api/recipes - CREATE
    @PostMapping
    public ResponseEntity<RecipeResponseDTO> createRecipe(@RequestBody RecipeRequestDTO recipeDTO) {
        // 1. Dùng Mapper: DTO -> Entity
        Recipe recipeEntity = recipeMapper.toEntity(recipeDTO);

        // 2. Gọi Service
        Recipe newRecipe = recipeService.createRecipe(recipeEntity);

        // 3. Dùng Mapper: Entity -> Response DTO
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(newRecipe);

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED); // 201 Created
    }

    // GET /api/recipes - READ ALL
    @GetMapping
    public ResponseEntity<List<RecipeResponseDTO>> getAllRecipes() {
        List<Recipe> recipes = recipeService.getAllRecipes();

        // Dùng Mapper để chuyển đổi danh sách Entity -> DTO
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);

        return ResponseEntity.ok(responseDTOs); // 200 OK
    }

    // GET /api/recipes/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id)
                .map(recipeMapper::toResponseDTO) // Chuyển Entity thành DTO
                .map(ResponseEntity::ok) // Nếu tìm thấy, trả về 200 OK
                .orElse(ResponseEntity.notFound().build()); // Nếu không tìm thấy, Exception sẽ không ném ra đây, mà là
                                                            // 404 (do Optional)
    }

    // GET /api/recipes/meal-type/{mealType} - READ BY MEAL TYPE
    @GetMapping("/meal-type/{mealType}")
    public ResponseEntity<List<RecipeResponseDTO>> getRecipesByMealType(@PathVariable MealType mealType) {
        List<Recipe> recipes = recipeService.getRecipesByMealType(mealType);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs); // 200 OK
    }

    // GET /api/recipes/search?name={name} - SEARCH BY TITLE
    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponseDTO>> searchRecipesByName(@RequestParam String name) {
        List<Recipe> recipes = recipeService.searchRecipesByTitle(name);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs); // 200 OK
    }

    // PUT /api/recipes/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> updateRecipe(@PathVariable Long id,
            @RequestBody RecipeRequestDTO recipeDTO) {
        // 1. Dùng Mapper: DTO -> Entity tạm thời để truyền dữ liệu cập nhật
        Recipe updateDetails = recipeMapper.toEntity(recipeDTO);

        // 2. Service sẽ ném ResourceNotFoundException (404) nếu không tìm thấy
        Recipe updatedRecipe = recipeService.updateRecipe(id, updateDetails);

        // 3. Dùng Mapper: Entity -> Response DTO
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(updatedRecipe);

        return ResponseEntity.ok(responseDTO); // 200 OK (Exception được xử lý tự động)
    }

    // DELETE /api/recipes/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        // Service sẽ ném ResourceNotFoundException (404) nếu không tìm thấy
        recipeService.deleteRecipe(id);

        return ResponseEntity.noContent().build(); // 204 No Content (Exception được xử lý tự động)
    }

    // ========== CATEGORY ENDPOINTS (7.6) ==========

    /**
     * GET /api/recipes/{id}/categories
     * Get categories for a recipe
     */
    @GetMapping("/{id}/categories")
    public ResponseEntity<List<CategoryDTO>> getRecipeCategories(@PathVariable Long id) {
        List<CategoryDTO> categories = categoryService.getCategoriesForRecipe(id);
        return ResponseEntity.ok(categories);
    }

    /**
     * POST /api/recipes/{id}/categories
     * Update recipe categories
     * MATCHES YOUR DOCUMENT 
     * Body: { "categoryIds": [1, 5, 8] }
     */
    @PostMapping("/{id}/categories")
    public ResponseEntity<Void> setRecipeCategories(
            @PathVariable Long id,
            @RequestBody SetRecipeCategoriesDTO requestDTO) {
        categoryService.setRecipeCategories(id, requestDTO.getCategoryIds());
        return ResponseEntity.ok().build();
    }

    /**
     * POST /api/recipes/{recipeId}/categories/{categoryId}
     * Add a single category to a recipe
     */
    @PostMapping("/{recipeId}/categories/{categoryId}")
    public ResponseEntity<Void> addCategoryToRecipe(
            @PathVariable Long recipeId,
            @PathVariable Long categoryId) {
        categoryService.addCategoryToRecipe(recipeId, categoryId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/recipes/{recipeId}/categories/{categoryId}
     * Remove a category from a recipe
     */
    @DeleteMapping("/{recipeId}/categories/{categoryId}")
    public ResponseEntity<Void> removeCategoryFromRecipe(
            @PathVariable Long recipeId,
            @PathVariable Long categoryId) {
        categoryService.removeCategoryFromRecipe(recipeId, categoryId);
        return ResponseEntity.noContent().build();
    }

    // ========== SIMILAR RECIPES ENDPOINT (7.2) ==========

    /**
     * GET /api/recipes/{id}/similar?limit=10
     * Get similar recipes based on categories, ingredients, and cooking time
     *
     * Similarity Algorithm:
     * - Shared Categories: +5 points each
     * - Shared Ingredients: +2 points each
     * - Similar Cooking Time (≤15 min): +1 point
     *
     * MATCHES YOUR DOCUMENT ✅
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<SimilarRecipeDTO>> getSimilarRecipes(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        List<SimilarRecipeDTO> similar = recommendationService.findSimilarRecipes(id, limit);
        return ResponseEntity.ok(similar);
    }
}
