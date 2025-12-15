package com.c2se04.familykitchenhub.DTO.Response;

public class RecipeStepDTO {
    private Long id;
    private Integer stepOrder;
    private String description;
    private String mediaUrl;

    // Constructors
    public RecipeStepDTO() {
    }

    public RecipeStepDTO(Long id, Integer stepOrder, String description, String mediaUrl) {
        this.id = id;
        this.stepOrder = stepOrder;
        this.description = description;
        this.mediaUrl = mediaUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public void setStepOrder(Integer stepOrder) {
        this.stepOrder = stepOrder;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }
}
