package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.RecipeIngredientRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.RecipeIngredientDTO;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import com.c2se04.familykitchenhub.Service.RecipeIngredientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recipes/{recipeId}/ingredients")
public class RecipeIngredientController {

        @Autowired
        private RecipeIngredientService recipeIngredientService;

        @GetMapping
        public ResponseEntity<List<RecipeIngredientDTO>> getRecipeIngredients(@PathVariable Long recipeId) {
                List<RecipeIngredient> ingredients = recipeIngredientService.getIngredientsByRecipeId(recipeId);
                List<RecipeIngredientDTO> dtos = ingredients.stream()
                                .map(ri -> new RecipeIngredientDTO(
                                                ri.getId(),
                                                ri.getIngredient().getId(),
                                                ri.getIngredient().getName(),
                                                ri.getQuantity(),
                                                ri.getUnit()))
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        @PostMapping
        public ResponseEntity<RecipeIngredientDTO> addIngredient(
                        @PathVariable Long recipeId,
                        @RequestBody RecipeIngredientRequestDTO request) {
                RecipeIngredient created = recipeIngredientService.addIngredient(
                                recipeId,
                                request.getIngredientId(),
                                request.getQuantity(),
                                request.getUnit());
                RecipeIngredientDTO dto = new RecipeIngredientDTO(
                                created.getId(),
                                created.getIngredient().getId(),
                                created.getIngredient().getName(),
                                created.getQuantity(),
                                created.getUnit());
                return new ResponseEntity<>(dto, HttpStatus.CREATED);
        }

        @PutMapping("/{ingredientId}")
        public ResponseEntity<RecipeIngredientDTO> updateIngredient(
                        @PathVariable Long recipeId,
                        @PathVariable Long ingredientId,
                        @RequestBody RecipeIngredientRequestDTO request) {
                RecipeIngredient updated = recipeIngredientService.updateIngredient(
                                ingredientId,
                                request.getIngredientId(),
                                request.getQuantity(),
                                request.getUnit());
                RecipeIngredientDTO dto = new RecipeIngredientDTO(
                                updated.getId(),
                                updated.getIngredient().getId(),
                                updated.getIngredient().getName(),
                                updated.getQuantity(),
                                updated.getUnit());
                return ResponseEntity.ok(dto);
        }

        @DeleteMapping("/{ingredientId}")
        public ResponseEntity<Void> deleteIngredient(
                        @PathVariable Long recipeId,
                        @PathVariable Long ingredientId) {
                recipeIngredientService.deleteIngredient(ingredientId);
                return ResponseEntity.noContent().build();
        }
}
