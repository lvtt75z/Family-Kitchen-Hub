package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;

/**
 * Represents the 'ingredients' master table.
 */
@Entity
@Table(name = "ingredients")
public class Ingredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    @Column(name = "unit")
    private String unit;

    @Column(name = "nutritional_info", columnDefinition = "JSON")
    private String nutritionalInfo;

    // --- Constructors, Getters, and Setters ---

    public Ingredient() {
    }

    // (Thêm getters và setters ở đây)
}