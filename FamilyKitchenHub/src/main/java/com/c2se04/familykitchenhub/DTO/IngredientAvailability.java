package com.c2se04.familykitchenhub.DTO;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO representing ingredient availability for a recipe
 */
public class IngredientAvailability {

    private List<IngredientStatus> available;
    private List<IngredientStatus> missing;

    public IngredientAvailability() {
        this.available = new ArrayList<>();
        this.missing = new ArrayList<>();
    }

    public void addAvailable(IngredientStatus status) {
        this.available.add(status);
    }

    public void addMissing(IngredientStatus status) {
        this.missing.add(status);
    }

    public List<IngredientStatus> getAvailable() {
        return available;
    }

    public void setAvailable(List<IngredientStatus> available) {
        this.available = available;
    }

    public List<IngredientStatus> getMissing() {
        return missing;
    }

    public void setMissing(List<IngredientStatus> missing) {
        this.missing = missing;
    }

    public boolean hasAllIngredients() {
        return missing.isEmpty();
    }

    public int getTotalIngredients() {
        return available.size() + missing.size();
    }

    public int getAvailableCount() {
        return available.size();
    }

    public int getMissingCount() {
        return missing.size();
    }
}
