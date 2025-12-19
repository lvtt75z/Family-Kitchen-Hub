package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.Request.AllergyRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.AllergyResponseDTO;
import com.c2se04.familykitchenhub.model.Allergy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface AllergyMapper {

    // Convert DTO to Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    Allergy toEntity(AllergyRequestDTO dto);

    // Convert Entity to Response DTO
    AllergyResponseDTO toResponseDTO(Allergy entity);

    // Convert List of Entities to List of Response DTOs
    List<AllergyResponseDTO> toResponseDTOList(List<Allergy> entities);

    // Convert Set of Entities to Set of Response DTOs
    Set<AllergyResponseDTO> toResponseDTOSet(Set<Allergy> entities);

    // Update Entity from DTO
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    void updateAllergyFromDto(AllergyRequestDTO dto, @MappingTarget Allergy entity);
}