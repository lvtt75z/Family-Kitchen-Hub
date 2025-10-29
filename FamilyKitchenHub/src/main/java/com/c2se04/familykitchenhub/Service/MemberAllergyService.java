package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Allergy;
import com.c2se04.familykitchenhub.model.FamilyMember;
import com.c2se04.familykitchenhub.model.MemberAllergy;
import com.c2se04.familykitchenhub.Repository.AllergyRepository;
import com.c2se04.familykitchenhub.Repository.FamilyMemberRepository;
import com.c2se04.familykitchenhub.Repository.MemberAllergyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class MemberAllergyService {

    private final MemberAllergyRepository memberAllergyRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final AllergyRepository allergyRepository;

    @Autowired
    public MemberAllergyService(MemberAllergyRepository memberAllergyRepository,
                                FamilyMemberRepository familyMemberRepository,
                                AllergyRepository allergyRepository) {
        this.memberAllergyRepository = memberAllergyRepository;
        this.familyMemberRepository = familyMemberRepository;
        this.allergyRepository = allergyRepository;
    }

    // CREATE
    @Transactional
    public MemberAllergy createMemberAllergy(Long memberId, Long allergyId) {
        // Validate FamilyMember exists
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", memberId));

        // Validate Allergy exists
        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));

        // Check if association already exists
        if (memberAllergyRepository.existsByMemberIdAndAllergyId(memberId, allergyId)) {
            throw new BadRequestException("This allergy is already associated with this family member");
        }

        MemberAllergy memberAllergy = new MemberAllergy(member, allergy);
        return memberAllergyRepository.save(memberAllergy);
    }

    // READ ALL
    public List<MemberAllergy> getAllMemberAllergies() {
        return memberAllergyRepository.findAll();
    }

    // READ BY MEMBER ID AND ALLERGY ID
    public Optional<MemberAllergy> getMemberAllergyById(Long memberId, Long allergyId) {
        return memberAllergyRepository.findByMemberIdAndAllergyId(memberId, allergyId);
    }

    // READ BY MEMBER ID
    public List<MemberAllergy> getMemberAllergiesByMemberId(Long memberId) {
        if (!familyMemberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("FamilyMember", "id", memberId);
        }
        return memberAllergyRepository.findByMemberId(memberId);
    }

    // READ BY ALLERGY ID
    public List<MemberAllergy> getMemberAllergiesByAllergyId(Long allergyId) {
        if (!allergyRepository.existsById(allergyId)) {
            throw new ResourceNotFoundException("Allergy", "id", allergyId);
        }
        return memberAllergyRepository.findByAllergyId(allergyId);
    }

    // DELETE
    @Transactional
    public void deleteMemberAllergy(Long memberId, Long allergyId) {
        if (!memberAllergyRepository.existsByMemberIdAndAllergyId(memberId, allergyId)) {
            throw new ResourceNotFoundException("MemberAllergy",
                    "memberId=" + memberId + ", allergyId=" + allergyId, null);
        }
        memberAllergyRepository.deleteByMemberIdAndAllergyId(memberId, allergyId);
    }
}