package com.c2se04.familykitchenhub.DTO;

import com.c2se04.familykitchenhub.enums.Season;
import jakarta.validation.constraints.Size;

public class RecipeScheduleDTO {

    private Long id;
    private Long recipeId;
    private Season season;

    @Size(max = 50, message = "Weather must not exceed 50 characters")
    private String weather;

    @Size(max = 100, message = "Occasion must not exceed 100 characters")
    private String occasion;

    private String notes;

    // Constructors
    public RecipeScheduleDTO() {
    }

    public RecipeScheduleDTO(Long id, Long recipeId, Season season, String weather, String occasion, String notes) {
        this.id = id;
        this.recipeId = recipeId;
        this.season = season;
        this.weather = weather;
        this.occasion = occasion;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(Long recipeId) {
        this.recipeId = recipeId;
    }

    public Season getSeason() {
        return season;
    }

    public void setSeason(Season season) {
        this.season = season;
    }

    public String getWeather() {
        return weather;
    }

    public void setWeather(String weather) {
        this.weather = weather;
    }

    public String getOccasion() {
        return occasion;
    }

    public void setOccasion(String occasion) {
        this.occasion = occasion;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
