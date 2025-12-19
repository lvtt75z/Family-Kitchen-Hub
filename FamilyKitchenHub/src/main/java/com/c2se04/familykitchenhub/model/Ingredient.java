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

    // Mapping biến 'unit' vào cột 'default_unit' của Database mới
    @Column(name = "default_unit")
    private String unit;

    // [MỚI] Thêm trường này để hỗ trợ tính toán Calo cho Recipe và Health Goals
    @Column(name = "calories_per_100g")
    private Integer caloriesPer100g;

    // [GIỮ NGUYÊN] Vẫn giữ trường JSON cũ của bạn để lưu chi tiết khác (Fat, Protein...)
    @Column(name = "nutritional_info", columnDefinition = "JSON")
    private String nutritionalInfo;

    // --- Constructors, Getters, and Setters ---

    public Ingredient() {
    }

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

    public Integer getCaloriesPer100g() {
        return caloriesPer100g;
    }

    public void setCaloriesPer100g(Integer caloriesPer100g) {
        this.caloriesPer100g = caloriesPer100g;
    }

    public String getNutritionalInfo() {
        return nutritionalInfo;
    }

    public void setNutritionalInfo(String nutritionalInfo) {
        this.nutritionalInfo = nutritionalInfo;
    }
}