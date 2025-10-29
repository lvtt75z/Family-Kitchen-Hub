package com.c2se04.familykitchenhub.DTO.Response;

import java.util.Set;

public class FamilyMemberResponseDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String name;
    private Integer age;
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

    public Set<AllergyResponseDTO> getAllergies() {
        return allergies;
    }

    public void setAllergies(Set<AllergyResponseDTO> allergies) {
        this.allergies = allergies;
    }
}