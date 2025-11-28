package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipe_popularity")
public class RecipePopularity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false, unique = true)
    private Recipe recipe;

    @Column(name = "search_count")
    private long searchCount = 0L;

    @Column(name = "bookmark_count")
    private long bookmarkCount = 0L;

    @Column(name = "popularity_score")
    private double popularityScore = 0D;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = LocalDateTime.now();
    }

    public void recalculateScore(double searchWeight, double bookmarkWeight) {
        this.popularityScore = searchCount * searchWeight + bookmarkCount * bookmarkWeight;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public long getSearchCount() {
        return searchCount;
    }

    public void setSearchCount(long searchCount) {
        this.searchCount = searchCount;
    }

    public long getBookmarkCount() {
        return bookmarkCount;
    }

    public void setBookmarkCount(long bookmarkCount) {
        this.bookmarkCount = bookmarkCount;
    }

    public double getPopularityScore() {
        return popularityScore;
    }

    public void setPopularityScore(double popularityScore) {
        this.popularityScore = popularityScore;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}

