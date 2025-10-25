package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents the 'allergies' table, storing a master list of all possible food allergies.
 */
@Entity
@Table(name = "allergies")
public class Allergy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false)
    private String name;

    /**
     * One-to-Many relationship with MemberAllergy entity.
     * This represents all family members who have this allergy.
     */
    @OneToMany(mappedBy = "allergy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<MemberAllergy> memberAllergies = new HashSet<>();

    // --- Constructors, Getters, and Setters ---

    public Allergy() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<MemberAllergy> getMemberAllergies() {
        return memberAllergies;
    }

    public void setMemberAllergies(Set<MemberAllergy> memberAllergies) {
        this.memberAllergies = memberAllergies;
    }
}
