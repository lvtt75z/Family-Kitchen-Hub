package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.enums.MealType;
import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Represents the 'meal_plan_entries' table, an entry in the user's meal calendar.
 */
@Entity
@Table(name = "meal_plan_entries")
public class MealPlanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;

    // --- Constructors, Getters, and Setters ---

    public MealPlanEntry() {
    }

    // (Thêm getters và setters ở đây)
}
