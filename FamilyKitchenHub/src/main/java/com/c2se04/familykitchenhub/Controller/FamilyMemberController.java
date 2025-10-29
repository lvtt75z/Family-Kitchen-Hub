package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.FamilyMemberRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.FamilyMemberResponseDTO;
import com.c2se04.familykitchenhub.Mapper.FamilyMemberMapper;
import com.c2se04.familykitchenhub.model.FamilyMember;
import com.c2se04.familykitchenhub.Service.FamilyMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-members")
public class FamilyMemberController {

    private final FamilyMemberService familyMemberService;
    private final FamilyMemberMapper familyMemberMapper;

    @Autowired
    public FamilyMemberController(FamilyMemberService familyMemberService, FamilyMemberMapper familyMemberMapper) {
        this.familyMemberService = familyMemberService;
        this.familyMemberMapper = familyMemberMapper;
    }

    // POST /api/family-members - CREATE
    @PostMapping
    public ResponseEntity<FamilyMemberResponseDTO> createFamilyMember(@RequestBody FamilyMemberRequestDTO familyMemberDTO) {
        FamilyMember familyMemberEntity = familyMemberMapper.toEntity(familyMemberDTO);
        FamilyMember newFamilyMember = familyMemberService.createFamilyMember(
                familyMemberEntity,
                familyMemberDTO.getUserId(),
                familyMemberDTO.getAllergyIds()
        );
        FamilyMemberResponseDTO responseDTO = familyMemberMapper.toResponseDTO(newFamilyMember);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // GET /api/family-members - READ ALL
    @GetMapping
    public ResponseEntity<List<FamilyMemberResponseDTO>> getAllFamilyMembers() {
        List<FamilyMember> familyMembers = familyMemberService.getAllFamilyMembers();
        List<FamilyMemberResponseDTO> responseDTOs = familyMemberMapper.toResponseDTOList(familyMembers);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/family-members/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<FamilyMemberResponseDTO> getFamilyMemberById(@PathVariable Long id) {
        return familyMemberService.getFamilyMemberById(id)
                .map(familyMemberMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/family-members/user/{userId} - READ BY USER ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FamilyMemberResponseDTO>> getFamilyMembersByUserId(@PathVariable Long userId) {
        List<FamilyMember> familyMembers = familyMemberService.getFamilyMembersByUserId(userId);
        List<FamilyMemberResponseDTO> responseDTOs = familyMemberMapper.toResponseDTOList(familyMembers);
        return ResponseEntity.ok(responseDTOs);
    }

    // PUT /api/family-members/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<FamilyMemberResponseDTO> updateFamilyMember(
            @PathVariable Long id,
            @RequestBody FamilyMemberRequestDTO familyMemberDTO) {
        FamilyMember updateDetails = familyMemberMapper.toEntity(familyMemberDTO);
        FamilyMember updatedFamilyMember = familyMemberService.updateFamilyMember(
                id,
                updateDetails,
                familyMemberDTO.getUserId(),
                familyMemberDTO.getAllergyIds()
        );
        FamilyMemberResponseDTO responseDTO = familyMemberMapper.toResponseDTO(updatedFamilyMember);
        return ResponseEntity.ok(responseDTO);
    }

    // DELETE /api/family-members/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyMember(@PathVariable Long id) {
        familyMemberService.deleteFamilyMember(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/family-members/{memberId}/allergies/{allergyId} - ADD ALLERGY
    @PostMapping("/{memberId}/allergies/{allergyId}")
    public ResponseEntity<FamilyMemberResponseDTO> addAllergyToFamilyMember(
            @PathVariable Long memberId,
            @PathVariable Long allergyId) {
        FamilyMember updatedMember = familyMemberService.addAllergyToFamilyMember(memberId, allergyId);
        FamilyMemberResponseDTO responseDTO = familyMemberMapper.toResponseDTO(updatedMember);
        return ResponseEntity.ok(responseDTO);
    }

    // DELETE /api/family-members/{memberId}/allergies/{allergyId} - REMOVE ALLERGY
    @DeleteMapping("/{memberId}/allergies/{allergyId}")
    public ResponseEntity<FamilyMemberResponseDTO> removeAllergyFromFamilyMember(
            @PathVariable Long memberId,
            @PathVariable Long allergyId) {
        FamilyMember updatedMember = familyMemberService.removeAllergyFromFamilyMember(memberId, allergyId);
        FamilyMemberResponseDTO responseDTO = familyMemberMapper.toResponseDTO(updatedMember);
        return ResponseEntity.ok(responseDTO);
    }
}