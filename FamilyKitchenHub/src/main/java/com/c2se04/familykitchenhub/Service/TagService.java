package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.TagDTO;
import com.c2se04.familykitchenhub.DTO.Request.TagRequestDTO;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Mapper.TagMapper;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.IngredientTagRepository;
import com.c2se04.familykitchenhub.Repository.TagRepository;
import com.c2se04.familykitchenhub.enums.TagType;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.model.IngredientTag;
import com.c2se04.familykitchenhub.model.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private IngredientTagRepository ingredientTagRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private TagMapper tagMapper;

    // Get all tags
    public List<TagDTO> getAllTags() {
        List<Tag> tags = tagRepository.findAll();
        return tagMapper.toDTOList(tags);
    }

    // Get tags by type
    public List<TagDTO> getTagsByType(TagType type) {
        List<Tag> tags = tagRepository.findByType(type);
        return tagMapper.toDTOList(tags);
    }

    // Get tag by ID
    public TagDTO getTagById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
        return tagMapper.toDTO(tag);
    }

    // Create tag
    @Transactional
    public TagDTO createTag(TagRequestDTO requestDTO) {
        // Check if tag already exists
        if (tagRepository.findByNameAndType(requestDTO.getName(), requestDTO.getType()).isPresent()) {
            throw new BadRequestException("Tag with name '" + requestDTO.getName() + "' and type '"
                    + requestDTO.getType() + "' already exists");
        }

        Tag tag = tagMapper.toEntity(requestDTO);
        Tag savedTag = tagRepository.save(tag);
        return tagMapper.toDTO(savedTag);
    }

    // Update tag
    @Transactional
    public TagDTO updateTag(Long id, TagRequestDTO requestDTO) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));

        tag.setName(requestDTO.getName());
        tag.setType(requestDTO.getType());
        tag.setDescription(requestDTO.getDescription());

        Tag updatedTag = tagRepository.save(tag);
        return tagMapper.toDTO(updatedTag);
    }

    // Delete tag
    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found with id: " + id);
        }

        // Cascade delete: Remove all ingredient_tags entries first
        ingredientTagRepository.deleteByTagId(id);

        // Then delete the tag
        tagRepository.deleteById(id);
    }

    // Search tags
    public List<TagDTO> searchTags(String keyword, TagType type) {
        List<Tag> tags;
        if (type != null) {
            tags = tagRepository.findByTypeAndNameContainingIgnoreCase(type, keyword);
        } else {
            tags = tagRepository.findByNameContainingIgnoreCase(keyword);
        }
        return tagMapper.toDTOList(tags);
    }

    // ========== INGREDIENT TAG OPERATIONS ==========

    // Get tags for ingredient
    public List<TagDTO> getTagsForIngredient(Long ingredientId) {
        if (!ingredientRepository.existsById(ingredientId)) {
            throw new ResourceNotFoundException("Ingredient not found with id: " + ingredientId);
        }

        List<IngredientTag> ingredientTags = ingredientTagRepository.findByIngredientId(ingredientId);
        List<Tag> tags = ingredientTags.stream()
                .map(IngredientTag::getTag)
                .toList();
        return tagMapper.toDTOList(tags);
    }

    // Add tags to ingredient
    @Transactional
    public void addTagsToIngredient(Long ingredientId, List<Long> tagIds) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found with id: " + ingredientId));

        for (Long tagId : tagIds) {
            Tag tag = tagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + tagId));

            // Check if already exists
            if (!ingredientTagRepository.existsByIngredientIdAndTagId(ingredientId, tagId)) {
                IngredientTag ingredientTag = new IngredientTag(ingredient, tag);
                ingredientTagRepository.save(ingredientTag);
            }
        }
    }

    // Remove tag from ingredient
    @Transactional
    public void removeTagFromIngredient(Long ingredientId, Long tagId) {
        if (!ingredientRepository.existsById(ingredientId)) {
            throw new ResourceNotFoundException("Ingredient not found with id: " + ingredientId);
        }
        if (!tagRepository.existsById(tagId)) {
            throw new ResourceNotFoundException("Tag not found with id: " + tagId);
        }

        ingredientTagRepository.deleteByIngredientIdAndTagId(ingredientId, tagId);
    }
}
