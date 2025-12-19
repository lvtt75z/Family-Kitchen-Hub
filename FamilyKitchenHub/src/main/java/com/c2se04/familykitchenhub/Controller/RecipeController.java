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
import com.c2se04.familykitchenhub.Service.MediaStorageService;
import com.c2se04.familykitchenhub.Service.RecipeRecommendationService;
import com.c2se04.familykitchenhub.Service.RecipeService;
import com.c2se04.familykitchenhub.Service.InventoryItemService;
import com.c2se04.familykitchenhub.DTO.Response.MediaUploadResponseDTO;
import com.c2se04.familykitchenhub.DTO.Response.CookRecipeResponseDTO;
import com.c2se04.familykitchenhub.model.RecipeImage;
import com.c2se04.familykitchenhub.enums.MediaType;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

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
    private MediaStorageService mediaStorageService;

    @Autowired
    private InventoryItemService inventoryItemService;

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

    // PATCH /api/recipes/{id} - PARTIAL UPDATE (chỉ update các field được gửi)
    @PatchMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> partialUpdateRecipe(@PathVariable Long id,
            @RequestBody RecipeRequestDTO recipeDTO) {
        Recipe updateDetails = recipeMapper.toEntity(recipeDTO);
        Recipe updatedRecipe = recipeService.updateRecipe(id, updateDetails);
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(updatedRecipe);
        return ResponseEntity.ok(responseDTO);
    }

    // POST /api/recipes/{id}/cook - NẤU/ĐẶT RECIPE (trừ nguyên liệu từ tủ lạnh ảo)
    @PostMapping("/{id}/cook")
    public ResponseEntity<CookRecipeResponseDTO> cookRecipe(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        try {
            // Lấy userId từ authentication context nếu có, nếu không thì từ query parameter
            Long finalUserId = userId;
            if (finalUserId == null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof User) {
                    User user = (User) authentication.getPrincipal();
                    finalUserId = user.getId();
                } else {
                    throw new BadRequestException(
                            "userId là bắt buộc. Vui lòng cung cấp userId trong query parameter hoặc đăng nhập để sử dụng userId từ authentication.");
                }
            }

            // Thực hiện trừ nguyên liệu và lấy thông tin chi tiết
            InventoryItemService.DeductResult result = inventoryItemService
                    .deductIngredientsForRecipeWithDetails(finalUserId, id);

            // Chuyển đổi sang DTO
            List<CookRecipeResponseDTO.DeductedIngredientDTO> deductedDTOs = result.getDeductedIngredients().stream()
                    .map(info -> new CookRecipeResponseDTO.DeductedIngredientDTO(
                            info.getIngredientId(),
                            info.getIngredientName(),
                            info.getDeductedQuantity(),
                            info.getRemainingQuantity(),
                            info.getUnit(),
                            info.isRemovedFromInventory()))
                    .collect(Collectors.toList());

            CookRecipeResponseDTO response = new CookRecipeResponseDTO(
                    "Đã nấu món ăn thành công! Nguyên liệu đã được trừ khỏi tủ lạnh ảo.",
                    result.getRecipeId(),
                    result.getRecipeTitle(),
                    deductedDTOs);

            return ResponseEntity.ok(response);
        } catch (com.c2se04.familykitchenhub.Exception.ResourceNotFoundException e) {
            // Let GlobalExceptionHandler handle 404
            throw e;
        } catch (BadRequestException e) {
            // Let GlobalExceptionHandler handle 400 - don't wrap it
            throw e;
        } catch (RuntimeException e) {
            // Convert RuntimeException to BadRequestException with clear message
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = "Đã xảy ra lỗi khi thực hiện nấu món ăn: " + e.getClass().getSimpleName();
            }
            throw new BadRequestException(errorMessage);
        } catch (Exception e) {
            // Fallback for any other unexpected exceptions
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = "Đã xảy ra lỗi không xác định khi thực hiện nấu món ăn";
            }
            throw new BadRequestException(errorMessage);
        }
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

    // ========== RECIPE FILTERING ENDPOINTS ==========

    /**
     * GET /api/recipes/cookable?userId={userId}
     * Get recipes that can be cooked with available ingredients in user's fridge
     */
    @GetMapping("/cookable")
    public ResponseEntity<List<RecipeResponseDTO>> getCookableRecipes(
            @RequestParam Long userId) {
        List<Recipe> cookableRecipes = recipeService.getCookableRecipes(userId);
        List<RecipeResponseDTO> responseDTOs = cookableRecipes.stream()
                .map(recipeMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * GET /api/recipes/bookmarked?userId={userId}
     * Get recipes bookmarked by the current user
     */
    @GetMapping("/bookmarked")
    public ResponseEntity<List<RecipeResponseDTO>> getBookmarkedRecipes(
            @RequestParam Long userId) {
        List<Recipe> bookmarkedRecipes = recipeService.getBookmarkedRecipesByUser(userId);
        List<RecipeResponseDTO> responseDTOs = bookmarkedRecipes.stream()
                .map(recipeMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
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
     * MATCHES YOUR DOCUMENT
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<SimilarRecipeDTO>> getSimilarRecipes(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        List<SimilarRecipeDTO> similar = recommendationService.findSimilarRecipes(id, limit);
        return ResponseEntity.ok(similar);
    }

    // ========== RECIPE IMAGES ENDPOINTS ==========

    /**
     * POST /api/recipes/{id}/images
     * Upload multiple images for a recipe from device files
     */
    @PostMapping(value = "/{id}/images", consumes = "multipart/form-data")
    public ResponseEntity<List<MediaUploadResponseDTO>> uploadRecipeImages(
            @PathVariable Long id,
            @RequestParam("files") List<MultipartFile> files) {

        // Validate recipe exists
        recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        // Validate files
        if (files == null || files.isEmpty()) {
            throw new com.c2se04.familykitchenhub.Exception.BadRequestException("Không có file nào được upload");
        }

        // Filter out empty files
        List<MultipartFile> validFiles = files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .collect(Collectors.toList());

        if (validFiles.isEmpty()) {
            throw new com.c2se04.familykitchenhub.Exception.BadRequestException("Tất cả các file đều rỗng");
        }

        // Upload files
        List<MediaUploadResponseDTO> uploadResults = mediaStorageService.storeMultiple(validFiles, MediaType.IMAGE);

        // Save image URLs to database
        List<String> imageUrls = uploadResults.stream()
                .map(MediaUploadResponseDTO::getUrl)
                .collect(Collectors.toList());

        List<String> fileNames = uploadResults.stream()
                .map(MediaUploadResponseDTO::getFileName)
                .collect(Collectors.toList());

        recipeService.addImagesToRecipe(id, imageUrls, fileNames);

        return new ResponseEntity<>(uploadResults, HttpStatus.CREATED);
    }

    /**
     * GET /api/recipes/{id}/images
     * Get all images for a recipe
     */
    @GetMapping("/{id}/images")
    public ResponseEntity<List<RecipeImageResponseDTO>> getRecipeImages(@PathVariable Long id) {
        List<RecipeImage> images = recipeService.getRecipeImages(id);
        List<RecipeImageResponseDTO> responseDTOs = images.stream()
                .map(img -> {
                    RecipeImageResponseDTO dto = new RecipeImageResponseDTO();
                    dto.setId(img.getId());
                    dto.setImageUrl(img.getImageUrl());
                    dto.setFileName(img.getFileName());
                    dto.setDisplayOrder(img.getDisplayOrder());
                    dto.setCreatedAt(img.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * DELETE /api/recipes/{id}/images/{imageId}
     * Delete a specific image from a recipe
     */
    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> deleteRecipeImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        recipeService.deleteRecipeImage(imageId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DTO for RecipeImage response
     */
    public static class RecipeImageResponseDTO {
        private Long id;
        private String imageUrl;
        private String fileName;
        private Integer displayOrder;
        private java.time.LocalDateTime createdAt;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
        }

        public java.time.LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(java.time.LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }
}
