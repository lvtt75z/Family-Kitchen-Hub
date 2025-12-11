package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.RecipeBookmarkRequest;
import com.c2se04.familykitchenhub.DTO.Request.RecipeSearchLogRequest;
import com.c2se04.familykitchenhub.DTO.Response.EngagementFeedResponse;
import com.c2se04.familykitchenhub.DTO.Response.RecipeEngagementResponseDTO;
import com.c2se04.familykitchenhub.DTO.Response.RecipePopularityResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.*;
import com.c2se04.familykitchenhub.Repository.projection.RecipeEngagementProjection;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeBookmark;
import com.c2se04.familykitchenhub.model.RecipePopularity;
import com.c2se04.familykitchenhub.model.RecipeSearchLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeAnalyticsService {

    private static final double SEARCH_WEIGHT = 0.5d;
    private static final double BOOKMARK_WEIGHT = 2d;

    private final RecipeSearchLogRepository recipeSearchLogRepository;
    private final RecipeBookmarkRepository recipeBookmarkRepository;
    private final RecipePopularityRepository recipePopularityRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Autowired
    public RecipeAnalyticsService(RecipeSearchLogRepository recipeSearchLogRepository,
                                  RecipeBookmarkRepository recipeBookmarkRepository,
                                  RecipePopularityRepository recipePopularityRepository,
                                  RecipeRepository recipeRepository,
                                  UserRepository userRepository) {
        this.recipeSearchLogRepository = recipeSearchLogRepository;
        this.recipeBookmarkRepository = recipeBookmarkRepository;
        this.recipePopularityRepository = recipePopularityRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void logSearch(RecipeSearchLogRequest request) {
        if (request == null || !StringUtils.hasText(request.getKeyword())) {
            throw new BadRequestException("Keyword tìm kiếm không được để trống");
        }

        RecipeSearchLog log = new RecipeSearchLog();
        log.setKeyword(request.getKeyword().trim());

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
            log.setUser(user);
        }

        Recipe recipe = null;
        if (request.getRecipeId() != null) {
            recipe = recipeRepository.findById(request.getRecipeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", request.getRecipeId()));
            log.setRecipe(recipe);
        }

        recipeSearchLogRepository.save(log);

        if (recipe != null) {
            incrementSearchCount(recipe);
        }
    }

    @Transactional
    public void addBookmark(Long recipeId, RecipeBookmarkRequest request) {
        if (request == null || request.getUserId() == null) {
            throw new BadRequestException("Thiếu userId cho yêu cầu bookmark");
        }
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        if (recipeBookmarkRepository.existsByUserAndRecipe(user, recipe)) {
            return; // idempotent
        }

        RecipeBookmark bookmark = new RecipeBookmark();
        bookmark.setRecipe(recipe);
        bookmark.setUser(user);
        recipeBookmarkRepository.save(bookmark);
        incrementBookmarkCount(recipe);
    }

    @Transactional
    public void removeBookmark(Long recipeId, Long userId) {
        if (userId == null) {
            throw new BadRequestException("Thiếu userId để gỡ bookmark");
        }
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        RecipeBookmark bookmark = recipeBookmarkRepository.findByUserAndRecipe(user, recipe)
                .orElseThrow(() -> new ResourceNotFoundException("Bookmark", "recipeId/userId", recipeId + "/" + userId));

        recipeBookmarkRepository.delete(bookmark);
        decrementBookmarkCount(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipePopularityResponseDTO> getPopularRecipes(int limit) {
        if (limit <= 0) {
            throw new BadRequestException("Limit phải lớn hơn 0");
        }
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "popularityScore"));
        return recipePopularityRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(this::mapToPopularityResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipePopularityResponseDTO> getTopBookmarkedRecipes(int limit) {
        if (limit <= 0) {
            throw new BadRequestException("Limit phải lớn hơn 0");
        }
        Pageable pageable = PageRequest.of(0, limit);
        return recipePopularityRepository.findTopByBookmarkCount(pageable)
                .stream()
                .map(this::mapToPopularityResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EngagementFeedResponse getEngagementFeed(int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page phải >= 0");
        }
        if (size <= 0 || size > 50) {
            throw new BadRequestException("Size phải trong khoảng 1-50");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<RecipeEngagementProjection> engagementPage = recipeRepository.findRecipesByEngagement(pageable);

        List<RecipeEngagementResponseDTO> items = engagementPage.getContent()
                .stream()
                .map(this::mapToEngagementResponse)
                .collect(Collectors.toList());

        boolean cacheable = page <= 5; // cho phép cache các page đầu
        return new EngagementFeedResponse(
                items,
                page,
                size,
                engagementPage.getTotalElements(),
                engagementPage.getTotalPages(),
                cacheable
        );
    }

    private RecipePopularityResponseDTO mapToPopularityResponse(RecipePopularity popularity) {
        Recipe recipe = popularity.getRecipe();
        RecipePopularityResponseDTO dto = new RecipePopularityResponseDTO();
        dto.setRecipeId(recipe.getId());
        dto.setRecipeTitle(recipe.getTitle());
        dto.setImageUrl(recipe.getImageUrl());
        dto.setPopularityScore(popularity.getPopularityScore());
        dto.setSearchCount(popularity.getSearchCount());
        dto.setBookmarkCount(popularity.getBookmarkCount());
        return dto;
    }

    private RecipeEngagementResponseDTO mapToEngagementResponse(RecipeEngagementProjection projection) {
        RecipeEngagementResponseDTO dto = new RecipeEngagementResponseDTO();
        dto.setRecipeId(projection.getRecipeId());
        dto.setTitle(projection.getTitle());
        dto.setImageUrl(projection.getImageUrl());

        double score = projection.getEngagementScore() != null ? projection.getEngagementScore() : 0D;
        dto.setEngagementScore(score);
        dto.setCommentCount(safeLong(projection.getCommentCount()));
        dto.setPhotoCount(safeLong(projection.getPhotoCount()));
        dto.setBookmarkCount(safeLong(projection.getBookmarkCount()));
        dto.setRankBucket(calculateRankBucket(score));
        dto.setHighEngagement(score >= 20D);
        dto.setUpdatedAt(LocalDateTime.now());
        return dto;
    }

    private void incrementSearchCount(Recipe recipe) {
        RecipePopularity popularity = getOrCreatePopularity(recipe);
        popularity.setSearchCount(popularity.getSearchCount() + 1);
        recalc(popularity);
    }

    private void incrementBookmarkCount(Recipe recipe) {
        RecipePopularity popularity = getOrCreatePopularity(recipe);
        popularity.setBookmarkCount(popularity.getBookmarkCount() + 1);
        recalc(popularity);
    }

    private void decrementBookmarkCount(Recipe recipe) {
        RecipePopularity popularity = getOrCreatePopularity(recipe);
        long current = Math.max(0, popularity.getBookmarkCount() - 1);
        popularity.setBookmarkCount(current);
        recalc(popularity);
    }

    private RecipePopularity getOrCreatePopularity(Recipe recipe) {
        return recipePopularityRepository.findByRecipe(recipe)
                .orElseGet(() -> {
                    RecipePopularity fresh = new RecipePopularity();
                    fresh.setRecipe(recipe);
                    fresh.recalculateScore(SEARCH_WEIGHT, BOOKMARK_WEIGHT);
                    return recipePopularityRepository.save(fresh);
                });
    }

    private void recalc(RecipePopularity popularity) {
        popularity.recalculateScore(SEARCH_WEIGHT, BOOKMARK_WEIGHT);
        recipePopularityRepository.save(popularity);
    }

    private int calculateRankBucket(double score) {
        if (score <= 0) {
            return 0;
        }
        return Math.min(99, (int) Math.floor(score / 5D));
    }

    private long safeLong(Long value) {
        return value != null ? value : 0L;
    }
}

