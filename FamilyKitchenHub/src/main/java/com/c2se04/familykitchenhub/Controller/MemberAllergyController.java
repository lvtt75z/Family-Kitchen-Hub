package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.MemberAllergyRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.MemberAllergyResponseDTO;
import com.c2se04.familykitchenhub.Mapper.MemberAllergyMapper;
import com.c2se04.familykitchenhub.model.MemberAllergy;
import com.c2se04.familykitchenhub.Service.MemberAllergyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/member-allergies")
public class MemberAllergyController {

    private final MemberAllergyService memberAllergyService;
    private final MemberAllergyMapper memberAllergyMapper;

    @Autowired
    public MemberAllergyController(MemberAllergyService memberAllergyService,
                                   MemberAllergyMapper memberAllergyMapper) {
        this.memberAllergyService = memberAllergyService;
        this.memberAllergyMapper = memberAllergyMapper;
    }

    // POST /api/member-allergies - CREATE
    @PostMapping
    public ResponseEntity<MemberAllergyResponseDTO> createMemberAllergy(@RequestBody MemberAllergyRequestDTO requestDTO) {
        MemberAllergy memberAllergy = memberAllergyService.createMemberAllergy(
                requestDTO.getMemberId(),
                requestDTO.getAllergyId()
        );
        MemberAllergyResponseDTO responseDTO = memberAllergyMapper.toResponseDTO(memberAllergy);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // GET /api/member-allergies - READ ALL
    @GetMapping
    public ResponseEntity<List<MemberAllergyResponseDTO>> getAllMemberAllergies() {
        List<MemberAllergy> memberAllergies = memberAllergyService.getAllMemberAllergies();
        List<MemberAllergyResponseDTO> responseDTOs = memberAllergyMapper.toResponseDTOList(memberAllergies);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/member-allergies?memberId={memberId}&allergyId={allergyId} - READ BY COMPOSITE ID
    @GetMapping(params = {"memberId", "allergyId"})
    public ResponseEntity<MemberAllergyResponseDTO> getMemberAllergyById(
            @RequestParam Long memberId,
            @RequestParam Long allergyId) {
        return memberAllergyService.getMemberAllergyById(memberId, allergyId)
                .map(memberAllergyMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/member-allergies/member/{memberId} - READ BY MEMBER ID
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<MemberAllergyResponseDTO>> getMemberAllergiesByMemberId(@PathVariable Long memberId) {
        List<MemberAllergy> memberAllergies = memberAllergyService.getMemberAllergiesByMemberId(memberId);
        List<MemberAllergyResponseDTO> responseDTOs = memberAllergyMapper.toResponseDTOList(memberAllergies);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/member-allergies/allergy/{allergyId} - READ BY ALLERGY ID
    @GetMapping("/allergy/{allergyId}")
    public ResponseEntity<List<MemberAllergyResponseDTO>> getMemberAllergiesByAllergyId(@PathVariable Long allergyId) {
        List<MemberAllergy> memberAllergies = memberAllergyService.getMemberAllergiesByAllergyId(allergyId);
        List<MemberAllergyResponseDTO> responseDTOs = memberAllergyMapper.toResponseDTOList(memberAllergies);
        return ResponseEntity.ok(responseDTOs);
    }

    // DELETE /api/member-allergies?memberId={memberId}&allergyId={allergyId} - DELETE
    @DeleteMapping
    public ResponseEntity<Void> deleteMemberAllergy(
            @RequestParam Long memberId,
            @RequestParam Long allergyId) {
        memberAllergyService.deleteMemberAllergy(memberId, allergyId);
        return ResponseEntity.noContent().build();
    }
}
