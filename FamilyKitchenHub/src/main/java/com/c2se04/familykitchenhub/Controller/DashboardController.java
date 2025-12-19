package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Response.DashboardStatsDTO;
import com.c2se04.familykitchenhub.DTO.Response.HotSearchDTO;
import com.c2se04.familykitchenhub.DTO.Response.RecipePopularityResponseDTO;
import com.c2se04.familykitchenhub.Service.DashboardService;
import com.c2se04.familykitchenhub.Service.RecipeAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Dashboard Controller for Admin Analytics
 * Provides statistics and insights for the admin dashboard
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final RecipeAnalyticsService recipeAnalyticsService;

    /**
     * GET /api/dashboard/stats
     * Get overall dashboard statistics
     * Returns total counts for users, recipes, ingredients, categories, allergies,
     * tags
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/dashboard/hot-searches?limit=10
     * Get top search keywords from recipe_search_logs table
     * Default limit: 10
     */
    @GetMapping("/hot-searches")
    public ResponseEntity<List<HotSearchDTO>> getHotSearches(
            @RequestParam(defaultValue = "10") int limit) {
        List<HotSearchDTO> hotSearches = dashboardService.getHotSearches(limit);
        return ResponseEntity.ok(hotSearches);
    }

    /**
     * GET /api/dashboard/popular-recipes?limit=10
     * Get top popular recipes by popularity score
     * Default limit: 10
     */
    @GetMapping("/popular-recipes")
    public ResponseEntity<List<RecipePopularityResponseDTO>> getPopularRecipes(
            @RequestParam(defaultValue = "10") int limit) {
        List<RecipePopularityResponseDTO> popularRecipes = recipeAnalyticsService.getPopularRecipes(limit);
        return ResponseEntity.ok(popularRecipes);
    }
}
