package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.RecipeScheduleDTO;
import com.c2se04.familykitchenhub.Service.RecipeScheduleService;
import com.c2se04.familykitchenhub.enums.Season;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Recipe Schedule (Occasion) management
 */
@RestController
@RequestMapping("/api/recipes")
public class RecipeScheduleController {

    private final RecipeScheduleService scheduleService;

    @Autowired
    public RecipeScheduleController(RecipeScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    /**
     * POST /api/recipes/{recipeId}/schedule
     * Set or update schedule metadata for a recipe
     */
    @PostMapping("/{recipeId}/schedule")
    public ResponseEntity<RecipeScheduleDTO> setRecipeSchedule(
            @PathVariable Long recipeId,
            @Valid @RequestBody RecipeScheduleDTO scheduleDTO) {
        RecipeScheduleDTO created = scheduleService.setRecipeSchedule(recipeId, scheduleDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/recipes/{recipeId}/schedule
     * Get schedule metadata for a recipe
     */
    @GetMapping("/{recipeId}/schedule")
    public ResponseEntity<RecipeScheduleDTO> getRecipeSchedule(@PathVariable Long recipeId) {
        return scheduleService.getScheduleByRecipeId(recipeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/recipes/{recipeId}/schedule
     * Delete schedule metadata for a recipe
     */
    @DeleteMapping("/{recipeId}/schedule")
    public ResponseEntity<Void> deleteRecipeSchedule(@PathVariable Long recipeId) {
        scheduleService.deleteScheduleByRecipeId(recipeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/recipes/schedules/season/{season}
     * Find recipes by season
     */
    @GetMapping("/schedules/season/{season}")
    public ResponseEntity<List<RecipeScheduleDTO>> getRecipesBySeason(@PathVariable Season season) {
        List<RecipeScheduleDTO> schedules = scheduleService.findBySeason(season);
        return ResponseEntity.ok(schedules);
    }

    /**
     * GET /api/recipes/schedules/occasion?q=holiday
     * Search recipes by occasion keyword
     */
    @GetMapping("/schedules/occasion")
    public ResponseEntity<List<RecipeScheduleDTO>> getRecipesByOccasion(@RequestParam String q) {
        List<RecipeScheduleDTO> schedules = scheduleService.findByOccasion(q);
        return ResponseEntity.ok(schedules);
    }
}
