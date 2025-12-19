package com.c2se04.familykitchenhub.DTO.Response;

import com.c2se04.familykitchenhub.DTO.TagDTO;
import java.util.List;

public class IngredientWithTagsDTO {
    private Long id;
    private String name;
    private String unit;
    private List<TagDTO> tags;

    // Constructors
    public IngredientWithTagsDTO() {}

    public IngredientWithTagsDTO(Long id, String name, String unit, List<TagDTO> tags) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.tags = tags;
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

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public List<TagDTO> getTags() {
        return tags;
    }

    public void setTags(List<TagDTO> tags) {
        this.tags = tags;
    }
}
