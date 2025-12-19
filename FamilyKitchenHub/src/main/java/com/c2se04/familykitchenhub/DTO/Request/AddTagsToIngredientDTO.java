package com.c2se04.familykitchenhub.DTO.Request;

import java.util.List;

public class AddTagsToIngredientDTO {
    private List<Long> tagIds;

    // Constructors
    public AddTagsToIngredientDTO() {}

    public AddTagsToIngredientDTO(List<Long> tagIds) {
        this.tagIds = tagIds;
    }

    // Getters and Setters
    public List<Long> getTagIds() {
        return tagIds;
    }

    public void setTagIds(List<Long> tagIds) {
        this.tagIds = tagIds;
    }
}