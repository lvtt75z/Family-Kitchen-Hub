package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.RecipeRequestDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.model.Recipe;
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
                .map(ResponseEntity::ok)        // Nếu tìm thấy, trả về 200 OK
                .orElse(ResponseEntity.notFound().build()); // Nếu không tìm thấy, Exception sẽ không ném ra đây, mà là 404 (do Optional)
    }

    // PUT /api/recipes/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> updateRecipe(@PathVariable Long id, @RequestBody RecipeRequestDTO recipeDTO) {
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

    // GET /api/recipes/search?title={title} - SEARCH BY TITLE
    @GetMapping("/search")
    public ResponseEntity<List<RecipeResponseDTO>> searchRecipesByTitle(@RequestParam String title) {
        List<Recipe> recipes = recipeService.searchRecipesByTitle(title);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/filter/cooking-time?max={maxMinutes} - FILTER BY MAX COOKING TIME
    @GetMapping("/filter/cooking-time")
    public ResponseEntity<List<RecipeResponseDTO>> filterByMaxCookingTime(@RequestParam Integer max) {
        List<Recipe> recipes = recipeService.filterByMaxCookingTime(max);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/filter/servings?servings={servings} - FILTER BY EXACT SERVINGS
    @GetMapping("/filter/servings")
    public ResponseEntity<List<RecipeResponseDTO>> filterByServings(@RequestParam Integer servings) {
        List<Recipe> recipes = recipeService.filterByServings(servings);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/filter/servings-range?min={min}&max={max} - FILTER BY SERVINGS RANGE
    @GetMapping("/filter/servings-range")
    public ResponseEntity<List<RecipeResponseDTO>> filterByServingsRange(
            @RequestParam(required = false) Integer min,
            @RequestParam(required = false) Integer max) {
        List<Recipe> recipes = recipeService.filterByServingsRange(min, max);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/search/ingredient?name={name} - SEARCH BY INGREDIENT NAME
    @GetMapping("/search/ingredient")
    public ResponseEntity<List<RecipeResponseDTO>> searchByIngredientName(@RequestParam String name) {
        List<Recipe> recipes = recipeService.searchByIngredientName(name);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/search/ingredient/{id} - SEARCH BY INGREDIENT ID
    @GetMapping("/search/ingredient/{id}")
    public ResponseEntity<List<RecipeResponseDTO>> searchByIngredientId(@PathVariable Long id) {
        List<Recipe> recipes = recipeService.searchByIngredientId(id);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/advanced-search - ADVANCED SEARCH WITH MULTIPLE FILTERS
    @GetMapping("/advanced-search")
    public ResponseEntity<List<RecipeResponseDTO>> advancedSearch(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer maxCookingTime,
            @RequestParam(required = false) Integer minServings,
            @RequestParam(required = false) Integer maxServings) {
        List<Recipe> recipes = recipeService.advancedSearch(title, maxCookingTime, minServings, maxServings);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // POST /api/recipes/search/with-ingredients - FIND RECIPES WITH ALL SPECIFIED INGREDIENTS
    @PostMapping("/search/with-ingredients")
    public ResponseEntity<List<RecipeResponseDTO>> findRecipesWithAllIngredients(
            @RequestBody List<Long> ingredientIds) {
        List<Recipe> recipes = recipeService.findRecipesWithAllIngredients(ingredientIds);
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/quick - GET QUICK RECIPES (30 minutes or less)
    @GetMapping("/quick")
    public ResponseEntity<List<RecipeResponseDTO>> getQuickRecipes() {
        List<Recipe> recipes = recipeService.getQuickRecipes();
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/recipes/group - GET RECIPES FOR GROUPS (6+ servings)
    @GetMapping("/group")
    public ResponseEntity<List<RecipeResponseDTO>> getGroupRecipes() {
        List<Recipe> recipes = recipeService.getGroupRecipes();
        List<RecipeResponseDTO> responseDTOs = recipeMapper.toResponseDTOList(recipes);
        return ResponseEntity.ok(responseDTOs);
    }
}