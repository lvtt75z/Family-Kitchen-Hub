package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Response.RecipeStepDTO;
import com.c2se04.familykitchenhub.model.RecipeStep;
import com.c2se04.familykitchenhub.Service.RecipeStepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes/{recipeId}/steps")
public class RecipeStepController {

    @Autowired
    private RecipeStepService recipeStepService;

    @GetMapping
    public ResponseEntity<List<RecipeStepDTO>> getRecipeSteps(@PathVariable Long recipeId) {
        List<RecipeStep> steps = recipeStepService.getStepsByRecipeId(recipeId);
        List<RecipeStepDTO> stepDTOs = steps.stream()
                .map(step -> new RecipeStepDTO(step.getId(), step.getStepOrder(), step.getDescription(),
                        step.getMediaUrl()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(stepDTOs);
    }

    @PostMapping
    public ResponseEntity<RecipeStepDTO> createStep(
            @PathVariable Long recipeId,
            @RequestBody RecipeStep step) {
        RecipeStep created = recipeStepService.createStep(recipeId, step);
        RecipeStepDTO dto = new RecipeStepDTO(created.getId(), created.getStepOrder(), created.getDescription(),
                created.getMediaUrl());
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PutMapping("/{stepId}")
    public ResponseEntity<RecipeStepDTO> updateStep(
            @PathVariable Long recipeId,
            @PathVariable Long stepId,
            @RequestBody RecipeStep step) {
        RecipeStep updated = recipeStepService.updateStep(stepId, step);
        RecipeStepDTO dto = new RecipeStepDTO(updated.getId(), updated.getStepOrder(), updated.getDescription(),
                updated.getMediaUrl());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{stepId}")
    public ResponseEntity<Void> deleteStep(
            @PathVariable Long recipeId,
            @PathVariable Long stepId) {
        recipeStepService.deleteStep(stepId);
        return ResponseEntity.noContent().build();
    }
}
