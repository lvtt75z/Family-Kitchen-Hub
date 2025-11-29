package com.c2se04.familykitchenhub.Repository.projection;

/**
 * Projection used when fetching the engagement feed.
 */
public interface RecipeEngagementProjection {

    Long getRecipeId();

    String getTitle();

    String getImageUrl();

    Double getEngagementScore();

    Long getCommentCount();

    Long getPhotoCount();

    Long getBookmarkCount();
}

