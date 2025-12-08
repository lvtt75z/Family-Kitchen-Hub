package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Allergy;
import com.c2se04.familykitchenhub.model.FamilyMember;
import com.c2se04.familykitchenhub.Entity.User; // Lưu ý: Kiểm tra lại package User của bạn là model hay Entity
import com.c2se04.familykitchenhub.Repository.AllergyRepository;
import com.c2se04.familykitchenhub.Repository.FamilyMemberRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class FamilyMemberService {

    private final FamilyMemberRepository familyMemberRepository;
    private final UserRepository userRepository;
    private final AllergyRepository allergyRepository;

    @Autowired
    public FamilyMemberService(FamilyMemberRepository familyMemberRepository,
                               UserRepository userRepository,
                               AllergyRepository allergyRepository) {
        this.familyMemberRepository = familyMemberRepository;
        this.userRepository = userRepository;
        this.allergyRepository = allergyRepository;
    }

    // CREATE
    @Transactional
    public FamilyMember createFamilyMember(FamilyMember familyMember, Long userId, Set<Long> allergyIds) {
        // Validate and set User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        familyMember.setUser(user);

        // Validate and set Allergies if provided
        if (allergyIds != null && !allergyIds.isEmpty()) {
            Set<Allergy> allergies = new HashSet<>();
            for (Long allergyId : allergyIds) {
                Allergy allergy = allergyRepository.findById(allergyId)
                        .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));
                allergies.add(allergy);
            }
            familyMember.setAllergies(allergies);
        }

        return familyMemberRepository.save(familyMember);
    }

    // READ ALL
    public List<FamilyMember> getAllFamilyMembers() {
        return familyMemberRepository.findAll();
    }

    // READ BY ID
    public Optional<FamilyMember> getFamilyMemberById(Long id) {
        return familyMemberRepository.findById(id);
    }

    // READ BY USER ID
    public List<FamilyMember> getFamilyMembersByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        return familyMemberRepository.findByUserId(userId);
    }

    // UPDATE
    @Transactional
    public FamilyMember updateFamilyMember(Long id, FamilyMember updatedDetails, Long userId, Set<Long> allergyIds) {
        FamilyMember existingMember = familyMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", id));

        // --- CẬP NHẬT CÁC TRƯỜNG DỮ LIỆU MỚI ---
        existingMember.setName(updatedDetails.getName());
        existingMember.setAge(updatedDetails.getAge());

        // Cập nhật các trường nhân khẩu học & sức khỏe mới
        existingMember.setGender(updatedDetails.getGender());
        existingMember.setHeightCm(updatedDetails.getHeightCm());
        existingMember.setWeightKg(updatedDetails.getWeightKg());
        existingMember.setActivityLevel(updatedDetails.getActivityLevel());
        existingMember.setIsAccountOwner(updatedDetails.getIsAccountOwner());

        // Cập nhật sở thích & bệnh lý (thay thế cho notes/healthGoals cũ)
        existingMember.setTastePreferences(updatedDetails.getTastePreferences());
        existingMember.setHealthConditions(updatedDetails.getHealthConditions());

        // Update User if userId is provided and different
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            existingMember.setUser(user);
        }

        // Update Allergies if provided
        if (allergyIds != null) {
            // Clear existing allergies
            existingMember.getAllergies().clear();

            // Add new allergies
            Set<Allergy> allergies = new HashSet<>();
            for (Long allergyId : allergyIds) {
                Allergy allergy = allergyRepository.findById(allergyId)
                        .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));
                allergies.add(allergy);
            }
            existingMember.getAllergies().addAll(allergies);
        }

        return familyMemberRepository.save(existingMember);
    }

    // DELETE
    @Transactional
    public void deleteFamilyMember(Long id) {
        if (!familyMemberRepository.existsById(id)) {
            throw new ResourceNotFoundException("FamilyMember", "id", id);
        }
        familyMemberRepository.deleteById(id);
    }

    // ADD ALLERGY
    @Transactional
    public FamilyMember addAllergyToFamilyMember(Long memberId, Long allergyId) {
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", memberId));

        Allergy allergy = allergyRepository.findById(allergyId)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", allergyId));

        boolean alreadyExists = member.getAllergies().stream()
                .anyMatch(a -> a.getId().equals(allergyId));

        if (!alreadyExists) {
            member.getAllergies().add(allergy);
        }

        return familyMemberRepository.save(member);
    }

    // REMOVE ALLERGY
    @Transactional
    public FamilyMember removeAllergyFromFamilyMember(Long memberId, Long allergyId) {
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("FamilyMember", "id", memberId));

        if (!allergyRepository.existsById(allergyId)) {
            throw new ResourceNotFoundException("Allergy", "id", allergyId);
        }

        member.getAllergies().removeIf(a -> a.getId().equals(allergyId));

        return familyMemberRepository.save(member);
    }
}