package com.c2se04.familykitchenhub.model;

import java.io.Serializable;
import java.util.Objects;

/**
 * Composite primary key for MemberAllergy entity.
 * Required for JPA when using composite primary key (member_id, allergy_id).
 */
public class MemberAllergyId implements Serializable {

    private Long member;
    private Long allergy;

    public MemberAllergyId() {
    }

    public MemberAllergyId(Long member, Long allergy) {
        this.member = member;
        this.allergy = allergy;
    }

    public Long getMember() {
        return member;
    }

    public void setMember(Long member) {
        this.member = member;
    }

    public Long getAllergy() {
        return allergy;
    }

    public void setAllergy(Long allergy) {
        this.allergy = allergy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MemberAllergyId that = (MemberAllergyId) o;
        return Objects.equals(member, that.member) && Objects.equals(allergy, that.allergy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(member, allergy);
    }
}
