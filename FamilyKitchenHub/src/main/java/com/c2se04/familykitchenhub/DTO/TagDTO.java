package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.enums.TagType;

public class TagDTO {
    private Long id;
    private String name;
    private TagType type;
    private String description;

    // Constructors
    public TagDTO() {}

    public TagDTO(Long id, String name, TagType type, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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