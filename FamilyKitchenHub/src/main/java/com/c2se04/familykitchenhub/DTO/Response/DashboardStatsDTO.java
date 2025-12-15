package com.c2se04.familykitchenhub.DTO.Response;

import java.util.Map;

/**
 * Dashboard statistics response DTO
 */
public class DashboardStatsDTO {

    private Long totalUsers;
    private Long totalRecipes;
    private Long totalIngredients;
    private Long totalCategories;
    private Long totalAllergies;
    private Long totalTags;
    private Long monthlyActiveUsers;
    private Map<String, Long> recentActivity; // e.g., {"comments": 45, "bookmarks": 89}

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(Long totalUsers, Long totalRecipes, Long totalIngredients,
            Long totalCategories, Long totalAllergies, Long totalTags) {
        this.totalUsers = totalUsers;
        this.totalRecipes = totalRecipes;
        this.totalIngredients = totalIngredients;
        this.totalCategories = totalCategories;
        this.totalAllergies = totalAllergies;
        this.totalTags = totalTags;
    }

    // Getters and Setters
    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalRecipes() {
        return totalRecipes;
    }

    public void setTotalRecipes(Long totalRecipes) {
        this.totalRecipes = totalRecipes;
    }

    public Long getTotalIngredients() {
        return totalIngredients;
    }

    public void setTotalIngredients(Long totalIngredients) {
        this.totalIngredients = totalIngredients;
    }

    public Long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(Long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public Long getTotalAllergies() {
        return totalAllergies;
    }

    public void setTotalAllergies(Long totalAllergies) {
        this.totalAllergies = totalAllergies;
    }

    public Long getTotalTags() {
        return totalTags;
    }

    public void setTotalTags(Long totalTags) {
        this.totalTags = totalTags;
    }

    public Long getMonthlyActiveUsers() {
        return monthlyActiveUsers;
    }

    public void setMonthlyActiveUsers(Long monthlyActiveUsers) {
        this.monthlyActiveUsers = monthlyActiveUsers;
    }

    public Map<String, Long> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(Map<String, Long> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
