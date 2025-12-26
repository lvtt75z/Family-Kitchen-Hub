package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.Mapper.RecipeMapper;
import com.c2se04.familykitchenhub.Service.RecipeService;
import com.c2se04.familykitchenhub.enums.RecipeStatus;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for admin recipe approval
 */
@RestController
@RequestMapping("/api/admin/recipes")
public class AdminRecipeController {

    private final RecipeService recipeService;
    private final RecipeMapper recipeMapper;

    @Autowired
    public AdminRecipeController(RecipeService recipeService, RecipeMapper recipeMapper) {
        this.recipeService = recipeService;
        this.recipeMapper = recipeMapper;
    }

    /**
     * GET /api/admin/recipes/pending
     * Get all recipes pending approval
     */
    @GetMapping("/pending")
    public ResponseEntity<List<RecipeResponseDTO>> getPendingRecipes() {
        List<Recipe> pendingRecipes = recipeService.getPendingRecipes();
        List<RecipeResponseDTO> responseDTOs = pendingRecipes.stream()
                .map(recipeMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

    /**
     * POST /api/admin/recipes/{id}/approve
     * Approve a recipe
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<RecipeResponseDTO> approveRecipe(
            @PathVariable Long id,
            @RequestParam Long adminId) {

        Recipe recipe = recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        if (recipe.getStatus() != RecipeStatus.PENDING_APPROVAL) {
            return ResponseEntity.badRequest().build();
        }

        recipe.setStatus(RecipeStatus.APPROVED);
        recipe.setReviewedByAdminId(adminId);
        recipe.setReviewedAt(LocalDateTime.now());
        recipe.setRejectionReason(null); // Clear any previous rejection reason

        Recipe approvedRecipe = recipeService.updateRecipe(id, recipe);
        return ResponseEntity.ok(recipeMapper.toResponseDTO(approvedRecipe));
    }

    /**
     * POST /api/admin/recipes/{id}/reject
     * Reject a recipe with reason
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<RecipeResponseDTO> rejectRecipe(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @RequestParam String reason) {

        Recipe recipe = recipeService.getRecipeById(id)
                .orElseThrow(
                        () -> new com.c2se04.familykitchenhub.Exception.ResourceNotFoundException("Recipe", "id", id));

        if (recipe.getStatus() != RecipeStatus.PENDING_APPROVAL) {
            return ResponseEntity.badRequest().build();
        }

        recipe.setStatus(RecipeStatus.REJECTED);
        recipe.setReviewedByAdminId(adminId);
        recipe.setReviewedAt(LocalDateTime.now());
        recipe.setRejectionReason(reason);

        Recipe rejectedRecipe = recipeService.updateRecipe(id, recipe);
        return ResponseEntity.ok(recipeMapper.toResponseDTO(rejectedRecipe));
    }

    /**
     * GET /api/admin/recipes/all-submissions
     * Get all user-submitted recipes (all statuses except ADMIN_CREATED)
     */
    @GetMapping("/all-submissions")
    public ResponseEntity<List<RecipeResponseDTO>> getAllSubmissions() {
        List<Recipe> submissions = recipeService.getAllUserSubmissions();
        List<RecipeResponseDTO> responseDTOs = submissions.stream()
                .map(recipeMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }
}
