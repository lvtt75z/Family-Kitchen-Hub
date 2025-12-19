package com.c2se04.familykitchenhub.DTO.Request;

import java.util.List;

public class SetRecipeCategoriesDTO {
    private List<Long> categoryIds;

    // Constructors
    public SetRecipeCategoriesDTO() {}

    public SetRecipeCategoriesDTO(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    // Getters and Setters
    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }
}




