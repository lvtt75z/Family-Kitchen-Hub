package com.c2se04.familykitchenhub.DTO;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class UserRecipeReminderDTO {

    private Long id;

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    private String recipeTitle;

    @NotNull(message = "Reminder time is required")
    @Future(message = "Reminder time must be in the future")
    private LocalDateTime reminderAt;

    private String note;
    private Boolean isSent;
    private Boolean isRead;
    private LocalDateTime createdAt;

    // Constructors
    public UserRecipeReminderDTO() {
    }

    public UserRecipeReminderDTO(Long id, Long recipeId, String recipeTitle, LocalDateTime reminderAt,
            String note, Boolean isSent, Boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.recipeId = recipeId;
        this.recipeTitle = recipeTitle;
        this.reminderAt = reminderAt;
        this.note = note;
        this.isSent = isSent;
        this.isRead = isRead;
        this.createdAt = createdAt;
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

    public String getRecipeTitle() {
        return recipeTitle;
    }

    public void setRecipeTitle(String recipeTitle) {
        this.recipeTitle = recipeTitle;
    }

    public LocalDateTime getReminderAt() {
        return reminderAt;
    }

    public void setReminderAt(LocalDateTime reminderAt) {
        this.reminderAt = reminderAt;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getIsSent() {
        return isSent;
    }

    public void setIsSent(Boolean sent) {
        isSent = sent;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean read) {
        isRead = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
