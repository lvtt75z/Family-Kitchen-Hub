package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.Entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents the 'inventory_items' table, an item in a user's pantry.
 */
@Entity
@Table(name = "inventory_items")
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = false)
    private Ingredient ingredient;

    @Column(name = "quantity")
    private Float quantity;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "purchased_at")
    private LocalDate purchasedAt;

    @Column(name = "expiration_notified")
    private Boolean expirationNotified = false;

    @Column(name = "expiration_notified_at")
    private LocalDateTime expirationNotifiedAt;

    @Column(name = "expiration_acknowledged_at")
    private LocalDateTime expirationAcknowledgedAt;

    // --- Constructors, Getters, and Setters ---

    public InventoryItem() {
    }

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

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
    }

    public Float getQuantity() {
        return quantity;
    }

    public void setQuantity(Float quantity) {
        this.quantity = quantity;
    }

    public LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public LocalDate getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(LocalDate purchasedAt) {
        this.purchasedAt = purchasedAt;
    }

    public Boolean getExpirationNotified() {
        return expirationNotified;
    }

    public void setExpirationNotified(Boolean expirationNotified) {
        this.expirationNotified = expirationNotified;
    }

    public LocalDateTime getExpirationNotifiedAt() {
        return expirationNotifiedAt;
    }

    public void setExpirationNotifiedAt(LocalDateTime expirationNotifiedAt) {
        this.expirationNotifiedAt = expirationNotifiedAt;
    }

    public LocalDateTime getExpirationAcknowledgedAt() {
        return expirationAcknowledgedAt;
    }

    public void setExpirationAcknowledgedAt(LocalDateTime expirationAcknowledgedAt) {
        this.expirationAcknowledgedAt = expirationAcknowledgedAt;
    }
}
