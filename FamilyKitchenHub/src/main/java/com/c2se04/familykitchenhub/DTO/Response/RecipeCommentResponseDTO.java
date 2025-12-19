package com.c2se04.familykitchenhub.DTO.Response;

import com.c2se04.familykitchenhub.enums.CommentStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RecipeCommentResponseDTO {

    private Long id;
    private Long recipeId;
    private Long userId;
    private String content;
    private CommentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CommentMediaResponseDTO> media = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public CommentStatus getStatus() {
        return status;
    }

    public void setStatus(CommentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CommentMediaResponseDTO> getMedia() {
        return media;
    }

    public void setMedia(List<CommentMediaResponseDTO> media) {
        this.media = media;
    }
}

