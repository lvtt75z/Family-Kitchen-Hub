package com.c2se04.familykitchenhub.DTO.Request;

import com.c2se04.familykitchenhub.enums.TagType;

public class TagRequestDTO {
    private String name;
    private TagType type;
    private String description;

    // Constructors
    public TagRequestDTO() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public TagType getType() {
        return type;
    }

    public void setType(TagType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}