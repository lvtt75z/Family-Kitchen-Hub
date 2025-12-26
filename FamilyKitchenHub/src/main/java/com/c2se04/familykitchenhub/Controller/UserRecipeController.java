package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.RecipeRequestDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Service.RecipeService;
import com.c2se04.familykitchenhub.enums.RecipeStatus;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for user-submitted recipes
 */
@RestController
@RequestMapping("/api/user-recipes")
public class UserRecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;

    @Autowired
    public UserRecipeController(RecipeService recipeService, RecipeMapper recipeMapper) {
        this.recipeService = recipeService;
        this.recipeMapper = recipeMapper;
    }

    /**
     * POST /api/user-recipes
     * Submit a new recipe (creates with PENDING_APPROVAL status)
     */
    @PostMapping
    public ResponseEntity<RecipeResponseDTO> submitRecipe(
            @RequestBody RecipeRequestDTO recipeDTO,
            @RequestParam Long userId) {

        Recipe recipeEntity = recipeMapper.toEntity(recipeDTO);

        // Set submission metadata
        recipeEntity.setStatus(RecipeStatus.PENDING_APPROVAL);
        recipeEntity.setSubmittedByUserId(userId);
        recipeEntity.setSubmittedAt(LocalDateTime.now());

        Recipe savedRecipe = recipeService.createRecipe(recipeEntity);
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(savedRecipe);

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * POST /api/user-recipes/draft
     * Save recipe as draft (creates with DRAFT status)
     */
    @PostMapping("/draft")
    public ResponseEntity<RecipeResponseDTO> saveDraft(
            @RequestBody RecipeRequestDTO recipeDTO,
            @RequestParam Long userId) {

        Recipe recipeEntity = recipeMapper.toEntity(recipeDTO);

        // Set as draft
        recipeEntity.setStatus(RecipeStatus.DRAFT);
        recipeEntity.setSubmittedByUserId(userId);
        recipeEntity.setSubmittedAt(LocalDateTime.now());

        Recipe savedRecipe = recipeService.createRecipe(recipeEntity);
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(savedRecipe);

        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    /**
     * GET /api/user-recipes/my-submissions?userId={userId}
     * Get all recipes submitted by current user
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<List<RecipeResponseDTO>> getMySubmissions(@RequestParam Long userId) {
        List<Recipe> userRecipes = recipeService.getUserSubmittedRecipes(userId);
        List<RecipeResponseDTO> responseDTOs = userRecipes.stream()
                .map(recipeMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * PUT /api/user-recipes/{id}
     * Update a draft or rejected recipe
     */
    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> updateMyRecipe(
            @PathVariable Long id,
            @RequestBody RecipeRequestDTO recipeDTO,
            @RequestParam Long userId) {

        // Verify ownership
        Recipe existingRecipe = recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        if (!existingRecipe.getSubmittedByUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only allow editing DRAFT or REJECTED recipes
        if (existingRecipe.getStatus() != RecipeStatus.DRAFT &&
                existingRecipe.getStatus() != RecipeStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Recipe updateDetails = recipeMapper.toEntity(recipeDTO);
        Recipe updatedRecipe = recipeService.updateRecipe(id, updateDetails);
        RecipeResponseDTO responseDTO = recipeMapper.toResponseDTO(updatedRecipe);

        return ResponseEntity.ok(responseDTO);
    }

    /**
     * PUT /api/user-recipes/{id}/submit
     * Submit a draft recipe for approval
     */
    @PutMapping("/{id}/submit")
    public ResponseEntity<RecipeResponseDTO> submitDraftForApproval(
            @PathVariable Long id,
            @RequestParam Long userId) {

        Recipe recipe = recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        if (!recipe.getSubmittedByUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only allow submitting DRAFT, REJECTED, or null status recipes
        if (recipe.getStatus() != null &&
                recipe.getStatus() != RecipeStatus.DRAFT &&
                recipe.getStatus() != RecipeStatus.REJECTED) {
            return ResponseEntity.badRequest()
                    .body(null); // Already submitted or approved
        }

        recipe.setStatus(RecipeStatus.PENDING_APPROVAL);
        recipe.setSubmittedAt(LocalDateTime.now());
        Recipe savedRecipe = recipeService.updateRecipe(id, recipe);

        return ResponseEntity.ok(recipeMapper.toResponseDTO(savedRecipe));
    }

    /**
     * DELETE /api/user-recipes/{id}
     * Delete own draft or rejected recipe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyRecipe(
            @PathVariable Long id,
            @RequestParam Long userId) {

        Recipe recipe = recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        if (!recipe.getSubmittedByUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only allow deleting DRAFT, PENDING_APPROVAL, or REJECTED recipes
        // Users cannot delete APPROVED or ADMIN_CREATED recipes
        if (recipe.getStatus() != RecipeStatus.DRAFT &&
                recipe.getStatus() != RecipeStatus.PENDING_APPROVAL &&
                recipe.getStatus() != RecipeStatus.REJECTED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }
}
