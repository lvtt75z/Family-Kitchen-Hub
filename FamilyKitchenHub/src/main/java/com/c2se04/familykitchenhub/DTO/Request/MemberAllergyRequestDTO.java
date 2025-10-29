package com.c2se04.familykitchenhub.DTO.Request;

public class MemberAllergyRequestDTO {
    private Long memberId;
    private Long allergyId;

    public MemberAllergyRequestDTO() {
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public Long getAllergyId() {
        return allergyId;
    }

    public void setAllergyId(Long allergyId) {
        this.allergyId = allergyId;
    }
}