package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.Entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Represents the 'user_recipe_reminders' table.
 * Stores user-specific reminders to cook recipes at certain times.
 */
@Entity
@Table(name = "user_recipe_reminders")
public class UserRecipeReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "reminder_at", nullable = false)
    private LocalDateTime reminderAt;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_sent", nullable = false)
    private Boolean isSent = false;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public UserRecipeReminder() {
    }

    public UserRecipeReminder(User user, Recipe recipe, LocalDateTime reminderAt, String note) {
        this.user = user;
        this.recipe = recipe;
        this.reminderAt = reminderAt;
        this.note = note;
        this.isSent = false;
        this.isRead = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
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
