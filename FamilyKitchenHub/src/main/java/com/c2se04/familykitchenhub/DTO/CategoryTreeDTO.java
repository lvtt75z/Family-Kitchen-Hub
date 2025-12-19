package com.c2se04.familykitchenhub.DTO;

import java.util.List;

public class CategoryTreeDTO {
    private Long id;
    private String name;
    private Long parentId;
    private List<CategoryTreeDTO> children;

    // Constructors
    public CategoryTreeDTO() {}

    public CategoryTreeDTO(Long id, String name, Long parentId) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
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

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<CategoryTreeDTO> getChildren() {
        return children;
    }

    public void setChildren(List<CategoryTreeDTO> children) {
        this.children = children;
    }
}




