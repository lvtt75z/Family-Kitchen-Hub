package com.c2se04.familykitchenhub.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InventoryItemResponseDTO {
    private Long id;
    private Float quantity;
    private LocalDate expirationDate;
    private LocalDate purchasedAt;
    private boolean expirationNotified;
    private LocalDateTime expirationNotifiedAt;
    private LocalDateTime expirationAcknowledgedAt;
    private Long ingredientId;
    private String ingredientName;
    private String unit;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Long ingredientId) {
        this.ingredientId = ingredientId;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public LocalDate getPurchasedAt() {
        return purchasedAt;
    }

    public void setPurchasedAt(LocalDate purchasedAt) {
        this.purchasedAt = purchasedAt;
    }

    public boolean isExpirationNotified() {
        return expirationNotified;
    }

    public void setExpirationNotified(boolean expirationNotified) {
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

