package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.DetectedIngredientDTO;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class IngredientMatchingService {

    @Autowired
    private IngredientRepository ingredientRepository;

    /**
     * Match detected ingredient name with database using fuzzy matching
     */
    public Ingredient findBestMatch(String detectedName) {
        List<Ingredient> allIngredients = ingredientRepository.findAll();

        if (allIngredients.isEmpty()) {
            return null;
        }

        // Try exact match first (case-insensitive)
        Optional<Ingredient> exactMatch = allIngredients.stream()
                .filter(ing -> ing.getName().equalsIgnoreCase(detectedName.trim()))
                .findFirst();

        if (exactMatch.isPresent()) {
            return exactMatch.isPresent() ? exactMatch.get() : null;
        }

        // Fuzzy matching using Levenshtein distance
        Ingredient bestMatch = null;
        int bestScore = Integer.MAX_VALUE;
        int threshold = 3; // Maximum edit distance

        for (Ingredient ingredient : allIngredients) {
            int distance = levenshteinDistance(
                    detectedName.toLowerCase().trim(),
                    ingredient.getName().toLowerCase().trim());

            if (distance < bestScore && distance <= threshold) {
                bestScore = distance;
                bestMatch = ingredient;
            }
        }

        return bestMatch;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];

        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }

        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(
                            Math.min(dp[i - 1][j], dp[i][j - 1]),
                            dp[i - 1][j - 1]);
                }
            }
        }

        return dp[s1.length()][s2.length()];
    }

    /**
     * Get top N closest matches for an unknown ingredient
     */
    public List<Map<String, Object>> getSuggestions(String detectedName, int topN) {
        List<Ingredient> allIngredients = ingredientRepository.findAll();
        List<Map<String, Object>> suggestions = new ArrayList<>();

        for (Ingredient ingredient : allIngredients) {
            int distance = levenshteinDistance(
                    detectedName.toLowerCase().trim(),
                    ingredient.getName().toLowerCase().trim());

            // Calculate similarity percentage (inverse of distance)
            double similarity = 1.0
                    - ((double) distance / Math.max(detectedName.length(), ingredient.getName().length()));

            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", ingredient.getId());
            suggestion.put("name", ingredient.getName());
            suggestion.put("similarity", Math.max(0, similarity));

            suggestions.add(suggestion);
        }

        // Sort by similarity descending
        suggestions.sort((a, b) -> Double.compare((Double) b.get("similarity"), (Double) a.get("similarity")));

        // Return top N
        return suggestions.subList(0, Math.min(topN, suggestions.size()));
    }
}
