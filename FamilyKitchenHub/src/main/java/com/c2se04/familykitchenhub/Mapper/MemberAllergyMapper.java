package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.Response.MemberAllergyResponseDTO;
import com.c2se04.familykitchenhub.model.MemberAllergy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface MemberAllergyMapper {

    // Convert Entity to Response DTO
    @Mapping(source = "member.id", target = "memberId")
    @Mapping(source = "member.name", target = "memberName")
    @Mapping(source = "allergy.id", target = "allergyId")
    @Mapping(source = "allergy.name", target = "allergyName")
    MemberAllergyResponseDTO toResponseDTO(MemberAllergy entity);

    // Convert List of Entities to List of Response DTOs
    List<MemberAllergyResponseDTO> toResponseDTOList(List<MemberAllergy> entities);
}
