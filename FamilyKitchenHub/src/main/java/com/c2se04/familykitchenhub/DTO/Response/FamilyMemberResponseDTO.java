package com.c2se04.familykitchenhub.DTO.Response;

import java.util.Set;

public class FamilyMemberResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String name;
    private Integer age;
    private String gender;
    private Float heightCm;
    private Float weightKg;
    private String activityLevel;
    private String tastePreferences;
    private String healthConditions;
    private String healthGoals;
    private String notes;
    private Set<AllergyResponseDTO> allergies;

    public FamilyMemberResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getHealthGoals() {
        return healthGoals;
    }

    public void setHealthGoals(String healthGoals) {
        this.healthGoals = healthGoals;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Float getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Float heightCm) {
        this.heightCm = heightCm;
    }

    public Float getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Float weightKg) {
        this.weightKg = weightKg;
    }

    public String getActivityLevel() {
        return activityLevel;
    }

    public void setActivityLevel(String activityLevel) {
        this.activityLevel = activityLevel;
    }

    public String getTastePreferences() {
        return tastePreferences;
    }

    public void setTastePreferences(String tastePreferences) {
        this.tastePreferences = tastePreferences;
    }

    public String getHealthConditions() {
        return healthConditions;
    }

    public void setHealthConditions(String healthConditions) {
        this.healthConditions = healthConditions;
    }

    public Set<AllergyResponseDTO> getAllergies() {
        return allergies;
    }

    public void setAllergies(Set<AllergyResponseDTO> allergies) {
        this.allergies = allergies;
    }
}