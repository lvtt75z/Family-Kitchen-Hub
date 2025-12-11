package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.RecipeBookmarkRequest;
import com.c2se04.familykitchenhub.DTO.Request.RecipeSearchLogRequest;
import com.c2se04.familykitchenhub.DTO.Response.RecipePopularityResponseDTO;
import com.c2se04.familykitchenhub.Service.RecipeAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeAnalyticsController {

    private final RecipeAnalyticsService recipeAnalyticsService;

    @Autowired
    public RecipeAnalyticsController(RecipeAnalyticsService recipeAnalyticsService) {
        this.recipeAnalyticsService = recipeAnalyticsService;
    }

    @PostMapping("/search-log")
    public ResponseEntity<Void> logSearch(@RequestBody RecipeSearchLogRequest request) {
        recipeAnalyticsService.logSearch(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{recipeId}/bookmarks")
    public ResponseEntity<Void> addBookmark(@PathVariable Long recipeId,
                                            @RequestBody RecipeBookmarkRequest request) {
        recipeAnalyticsService.addBookmark(recipeId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{recipeId}/bookmarks")
    public ResponseEntity<Void> removeBookmark(@PathVariable Long recipeId,
                                               @RequestParam Long userId) {
        recipeAnalyticsService.removeBookmark(recipeId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/popular")
    public ResponseEntity<List<RecipePopularityResponseDTO>> popularRecipes(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recipeAnalyticsService.getPopularRecipes(limit));
    }

    @GetMapping("/top-bookmarked")
    public ResponseEntity<List<RecipePopularityResponseDTO>> topBookmarkedRecipes(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(recipeAnalyticsService.getTopBookmarkedRecipes(limit));
    }
}

