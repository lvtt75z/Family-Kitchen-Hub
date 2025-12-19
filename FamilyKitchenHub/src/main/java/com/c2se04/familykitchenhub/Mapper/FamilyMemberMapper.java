package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.Response.AllergyResponseDTO;
import com.c2se04.familykitchenhub.DTO.Request.FamilyMemberRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.FamilyMemberResponseDTO;
import com.c2se04.familykitchenhub.model.FamilyMember;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {AllergyMapper.class})
public interface FamilyMemberMapper {

    // Convert DTO to Entity (will be handled in service layer for relationships)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "allergies", ignore = true)
    FamilyMember toEntity(FamilyMemberRequestDTO dto);

    // Convert Entity to Response DTO
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "userName")
    @Mapping(target = "allergies", ignore = true)
    FamilyMemberResponseDTO toResponseDTO(FamilyMember entity);

    // Convert List of Entities to List of Response DTOs
    List<FamilyMemberResponseDTO> toResponseDTOList(List<FamilyMember> entities);

    // Update Entity from DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "allergies", ignore = true)
    void updateFamilyMemberFromDto(FamilyMemberRequestDTO dto, @MappingTarget FamilyMember entity);

    // After mapping, convert Allergy to AllergyResponseDTO
    @AfterMapping
    default void mapAllergies(@MappingTarget FamilyMemberResponseDTO responseDTO, FamilyMember entity) {
        if (entity.getAllergies() != null && !entity.getAllergies().isEmpty()) {
            Set<AllergyResponseDTO> allergyDTOs = entity.getAllergies().stream()
                    .map(allergy -> {
                        AllergyResponseDTO dto = new AllergyResponseDTO();
                        dto.setId(allergy.getId());
                        dto.setName(allergy.getName());
                        return dto;
                    })
                    .collect(Collectors.toSet());
            responseDTO.setAllergies(allergyDTOs);
        } else {
            responseDTO.setAllergies(new HashSet<>());
        }
    }
}