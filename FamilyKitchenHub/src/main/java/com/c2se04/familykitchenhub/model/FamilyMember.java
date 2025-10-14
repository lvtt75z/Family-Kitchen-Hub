package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.Entity.User;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents the 'family_members' table.
 * Each instance is a family member linked to a primary User account.
 */
@Entity
@Table(name = "family_members")
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Many-to-One relationship with the User entity.
     * Many family members can belong to one user.
     * The 'user_id' column in this table is the foreign key.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "age")
    private Integer age;

    @Column(name = "health_goals", columnDefinition = "TEXT")
    private String healthGoals;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /**
     * Many-to-Many relationship with the Allergy entity.
     * A family member can have multiple allergies.
     * This relationship is managed by the 'member_allergies' junction table.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "member_allergies",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "allergy_id")
    )
    private Set<Allergy> allergies = new HashSet<>();

    // --- Constructors, Getters, and Setters ---

    public FamilyMember() {
    }

    // Getters and Setters for all fields
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

    public Set<Allergy> getAllergies() {
        return allergies;
    }

    public void setAllergies(Set<Allergy> allergies) {
        this.allergies = allergies;
    }
}