package com.c2se04.familykitchenhub.DTO.Response;

import java.time.LocalDateTime;

public class RecipeEngagementResponseDTO {

    private Long recipeId;
    private String title;
    private String imageUrl;
    private double engagementScore;
    private long commentCount;
    private long photoCount;
    private long bookmarkCount;
    private int rankBucket;
    private boolean highEngagement;
    private LocalDateTime updatedAt;

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(double engagementScore) {
        this.engagementScore = engagementScore;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public long getPhotoCount() {
        return photoCount;
    }

    public void setPhotoCount(long photoCount) {
        this.photoCount = photoCount;
    }

    public long getBookmarkCount() {
        return bookmarkCount;
    }

    public void setBookmarkCount(long bookmarkCount) {
        this.bookmarkCount = bookmarkCount;
    }

    public int getRankBucket() {
        return rankBucket;
    }

    public void setRankBucket(int rankBucket) {
        this.rankBucket = rankBucket;
    }

    public boolean isHighEngagement() {
        return highEngagement;
    }

    public void setHighEngagement(boolean highEngagement) {
        this.highEngagement = highEngagement;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

