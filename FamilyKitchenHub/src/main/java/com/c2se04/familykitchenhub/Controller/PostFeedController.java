package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Response.EngagementFeedResponse;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Service.RecipeAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostFeedController {

    private final RecipeAnalyticsService recipeAnalyticsService;

    @Autowired
    public PostFeedController(RecipeAnalyticsService recipeAnalyticsService) {
        this.recipeAnalyticsService = recipeAnalyticsService;
    }

    @GetMapping
    public ResponseEntity<EngagementFeedResponse> getPosts(
            @RequestParam(defaultValue = "engagement") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (!"engagement".equalsIgnoreCase(sort)) {
            throw new BadRequestException("Chỉ hỗ trợ sort=engagement cho feed này");
        }

        return ResponseEntity.ok(recipeAnalyticsService.getEngagementFeed(page, size));
    }
}

