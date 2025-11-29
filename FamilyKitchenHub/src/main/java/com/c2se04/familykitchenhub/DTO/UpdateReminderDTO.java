package com.c2se04.familykitchenhub.DTO;

import jakarta.validation.constraints.Future;

import java.time.LocalDateTime;

/**
 * DTO for updating user recipe reminders
 * Does not require recipeId since it cannot be changed
 */
public class UpdateReminderDTO {

    @Future(message = "Reminder time must be in the future")
    private LocalDateTime reminderAt;

    private String note;

    // Constructors
    public UpdateReminderDTO() {
    }

    public UpdateReminderDTO(LocalDateTime reminderAt, String note) {
        this.reminderAt = reminderAt;
        this.note = note;
    }

    // Getters and Setters
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
}
