package com.c2se04.familykitchenhub.model;

import jakarta.persistence.*;

/**
 * Represents the 'member_allergies' junction table.
 * Uses composite primary key (member_id, allergy_id).
 */
@Entity
@Table(name = "member_allergies")
@IdClass(MemberAllergyId.class)
public class MemberAllergy {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private FamilyMember member;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allergy_id", nullable = false)
    private Allergy allergy;

    public MemberAllergy() {
    }

    public MemberAllergy(FamilyMember member, Allergy allergy) {
        this.member = member;
        this.allergy = allergy;
    }

    public FamilyMember getMember() {
        return member;
    }

    public void setMember(FamilyMember member) {
        this.member = member;
    }

    public Allergy getAllergy() {
        return allergy;
    }

    public void setAllergy(Allergy allergy) {
        this.allergy = allergy;
    }
}