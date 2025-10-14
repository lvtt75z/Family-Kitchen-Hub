package com.c2se04.familykitchenhub.DTO;

import java.time.LocalDate;

/**
 * DTO để tạo mới hoặc cập nhật InventoryItem.
 */
public class InventoryItemDTO {

    private Long userId;          // ID của User sở hữu
    private Long ingredientId;    // ID của Ingredient (Thành phần)
    private Float quantity;
    private LocalDate expirationDate;

    // --- Constructors, Getters, and Setters ---
    public InventoryItemDTO() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getIngredientId() { return ingredientId; }
    public void setIngredientId(Long ingredientId) { this.ingredientId = ingredientId; }

    public Float getQuantity() { return quantity; }
    public void setQuantity(Float quantity) { this.quantity = quantity; }

    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
}