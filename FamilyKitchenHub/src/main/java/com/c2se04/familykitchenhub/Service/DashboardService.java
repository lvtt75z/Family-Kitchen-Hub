package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Response.DashboardStatsDTO;
import com.c2se04.familykitchenhub.DTO.Response.HotSearchDTO;
import com.c2se04.familykitchenhub.Repository.*;
import com.c2se04.familykitchenhub.model.RecipeSearchLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;
    private final IngredientRepository ingredientRepository;
    private final CategoryRepository categoryRepository;
    private final AllergyRepository allergyRepository;
    private final TagRepository tagRepository;
    private final RecipeSearchLogRepository searchLogRepository;

    /**
     * Get overall dashboard statistics
     */
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        stats.setTotalUsers(userRepository.count());
        stats.setTotalRecipes(recipeRepository.count());
        stats.setTotalIngredients(ingredientRepository.count());
        stats.setTotalCategories(categoryRepository.count());
        stats.setTotalAllergies(allergyRepository.count());
        stats.setTotalTags(tagRepository.count());

        // Calculate monthly active users (registered in last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Long monthlyActive = userRepository.countByCreatedAtAfter(thirtyDaysAgo);
        stats.setMonthlyActiveUsers(monthlyActive);

        return stats;
    }

    /**
     * Get hot search keywords from search logs
     * Returns top N most searched keywords
     */
    public List<HotSearchDTO> getHotSearches(int limit) {
        List<RecipeSearchLog> searchLogs = searchLogRepository.findAll();

        // Group by keyword and count occurrences
        Map<String, Long> keywordCounts = searchLogs.stream()
                .filter(log -> log.getKeyword() != null && !log.getKeyword().trim().isEmpty())
                .collect(Collectors.groupingBy(
                        RecipeSearchLog::getKeyword,
                        Collectors.counting()));

        // Convert to DTOs and sort by count descending
        return keywordCounts.entrySet().stream()
                .map(entry -> new HotSearchDTO(entry.getKey(), entry.getValue()))
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

}
