package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.MemberAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberAllergyRepository extends JpaRepository<MemberAllergy, Long> {
    List<MemberAllergy> findByMemberId(Long memberId);
    List<MemberAllergy> findByAllergyId(Long allergyId);
    Optional<MemberAllergy> findByMemberIdAndAllergyId(Long memberId, Long allergyId);
    void deleteByMemberIdAndAllergyId(Long memberId, Long allergyId);
    boolean existsByMemberIdAndAllergyId(Long memberId, Long allergyId);
}

