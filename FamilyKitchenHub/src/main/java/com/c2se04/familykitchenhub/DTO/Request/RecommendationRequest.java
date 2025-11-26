package com.c2se04.familykitchenhub.DTO.Request;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class RecommendationRequest {

    @JsonProperty("inventory_ingredient_ids")
    private List<Long> inventoryIngredientIds;

    @JsonProperty("family_profiles")
    private List<Object> familyProfiles;

    @JsonProperty("all_recipes")
    private List<Object> allRecipes;

    // Constructor bắt buộc
    public RecommendationRequest(List<Long> inventoryIngredientIds, List<Object> familyProfiles, List<Object> allRecipes) {
        this.inventoryIngredientIds = inventoryIngredientIds;
        this.familyProfiles = familyProfiles;
        this.allRecipes = allRecipes;
    }

    // Getters và Setters (Rất quan trọng, nếu thiếu Jackson sẽ không hoạt động)
    public List<Long> getInventoryIngredientIds() { return inventoryIngredientIds; }
    public void setInventoryIngredientIds(List<Long> inventoryIngredientIds) { this.inventoryIngredientIds = inventoryIngredientIds; }

    public List<Object> getFamilyProfiles() { return familyProfiles; }
    public void setFamilyProfiles(List<Object> familyProfiles) { this.familyProfiles = familyProfiles; }

    public List<Object> getAllRecipes() { return allRecipes; }
    public void setAllRecipes(List<Object> allRecipes) { this.allRecipes = allRecipes; }
}
