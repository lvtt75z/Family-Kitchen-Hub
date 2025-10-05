package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;
import java.time.LocalDate;

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

    // --- Constructors, Getters, and Setters ---

    public InventoryItem() {
    }

    // (Thêm getters và setters ở đây)
}
