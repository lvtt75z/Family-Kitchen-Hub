package com.c2se04.familykitchenhub.DTO.Request;

import com.c2se04.familykitchenhub.enums.ActivityLevel;
import com.c2se04.familykitchenhub.enums.Gender;
import java.util.Set;

public class FamilyMemberRequestDTO {

    private Long userId;
    private String name;
    private Integer age;
    private Gender gender;
    private Float heightCm;
    private Float weightKg;
    private ActivityLevel activityLevel;
    private Boolean isAccountOwner;

    private String tastePreferences;
    private String healthConditions;

    private Set<Long> allergyIds;

    public FamilyMemberRequestDTO() {
    }

    // ---------- GETTERS / SETTERS ----------
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
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

    public ActivityLevel getActivityLevel() {
        return activityLevel;
    }

    public void setActivityLevel(ActivityLevel activityLevel) {
        this.activityLevel = activityLevel;
    }

    public Boolean getIsAccountOwner() {
        return isAccountOwner;
    }

    public void setIsAccountOwner(Boolean isAccountOwner) {
        this.isAccountOwner = isAccountOwner;
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

    public Set<Long> getAllergyIds() {
        return allergyIds;
    }

    public void setAllergyIds(Set<Long> allergyIds) {
        this.allergyIds = allergyIds;
    }
}
