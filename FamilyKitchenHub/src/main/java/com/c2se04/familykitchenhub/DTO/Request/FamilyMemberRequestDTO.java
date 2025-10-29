package com.c2se04.familykitchenhub.DTO.Request;

import java.util.Set;

public class FamilyMemberRequestDTO {
    private Long userId;
    private String name;
    private Integer age;
    private String healthGoals;
    private String notes;
    private Set<Long> allergyIds;

    public FamilyMemberRequestDTO() {
    }

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

    public Set<Long> getAllergyIds() {
        return allergyIds;
    }

    public void setAllergyIds(Set<Long> allergyIds) {
        this.allergyIds = allergyIds;
    }
}