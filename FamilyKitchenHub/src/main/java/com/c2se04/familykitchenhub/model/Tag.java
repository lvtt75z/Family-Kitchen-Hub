package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.enums.TagType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tags",
        indexes = {
                @Index(name = "idx_type", columnList = "type"),
                @Index(name = "idx_name", columnList = "name")
        },
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_name_type", columnNames = {"name", "type"})
        }
)
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TagType type;

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Constructors
    public Tag() {}

    public Tag(String name, TagType type, String description) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

