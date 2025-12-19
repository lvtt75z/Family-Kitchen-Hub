package com.c2se04.familykitchenhub.DTO;

/**
 * DTO representing the status of a single ingredient
 */
public class IngredientStatus {

    private String name;
    private Float quantityRequired;
    private Float quantityAvailable;
    private String unit;

    public IngredientStatus() {
    }

    public IngredientStatus(String name, Float quantityRequired, Float quantityAvailable, String unit) {
        this.name = name;
        this.quantityRequired = quantityRequired;
        this.quantityAvailable = quantityAvailable;
        this.unit = unit;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Float getQuantityRequired() {
        return quantityRequired;
    }

    public void setQuantityRequired(Float quantityRequired) {
        this.quantityRequired = quantityRequired;
    }

    public Float getQuantityAvailable() {
        return quantityAvailable;
    }

    public void setQuantityAvailable(Float quantityAvailable) {
        this.quantityAvailable = quantityAvailable;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Float getQuantityLacking() {
        return Math.max(0, quantityRequired - quantityAvailable);
    }

    public boolean isAvailable() {
        return quantityAvailable >= quantityRequired;
    }
}
