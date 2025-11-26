package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.TagDTO;
import com.c2se04.familykitchenhub.DTO.Request.TagRequestDTO;
import com.c2se04.familykitchenhub.model.Tag;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TagMapper {

    // Entity to DTO
    public TagDTO toDTO(Tag tag) {
        if (tag == null) {
            return null;
        }
        return new TagDTO(
                tag.getId(),
                tag.getName(),
                tag.getType(),
                tag.getDescription()
        );
    }

    // List of entities to DTOs
    public List<TagDTO> toDTOList(List<Tag> tags) {
        return tags.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Request DTO to Entity
    public Tag toEntity(TagRequestDTO dto) {
        if (dto == null) {
            return null;
        }
        Tag tag = new Tag();
        tag.setName(dto.getName());
        tag.setType(dto.getType());
        tag.setDescription(dto.getDescription());
        return tag;
    }
}
