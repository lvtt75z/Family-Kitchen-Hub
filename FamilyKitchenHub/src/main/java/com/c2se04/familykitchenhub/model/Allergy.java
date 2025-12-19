package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;
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

    // This field represents the other side of the many-to-many relationship
    // It is not a column in the 'allergies' table
    @ManyToMany(mappedBy = "allergies")
    private Set<FamilyMember> members;

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

    public Set<FamilyMember> getMembers() {
        return members;
    }

    public void setMembers(Set<FamilyMember> members) {
        this.members = members;
    }
}
