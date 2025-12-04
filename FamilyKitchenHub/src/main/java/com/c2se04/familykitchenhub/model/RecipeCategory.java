package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recipe_categories", indexes = {
    @Index(name = "idx_parent", columnList = "parent_id")
})
public class RecipeCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private RecipeCategory parent;

    @OneToMany(mappedBy = "parent")
    private List<RecipeCategory> children = new ArrayList<>();

    // Constructors
    public RecipeCategory() {}

    public RecipeCategory(String name) {
        this.name = name;
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

    public RecipeCategory getParent() {
        return parent;
    }

    public void setParent(RecipeCategory parent) {
        this.parent = parent;
    }

    public List<RecipeCategory> getChildren() {
        return children;
    }

    public void setChildren(List<RecipeCategory> children) {
        this.children = children;
    }
}







