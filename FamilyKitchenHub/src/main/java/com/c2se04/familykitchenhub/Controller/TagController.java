package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.TagDTO;
import com.c2se04.familykitchenhub.DTO.Request.AddTagsToIngredientDTO;
import com.c2se04.familykitchenhub.DTO.Request.TagRequestDTO;
import com.c2se04.familykitchenhub.Service.TagService;
import com.c2se04.familykitchenhub.enums.TagType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    // ========== TAG MANAGEMENT ==========

    /**
     * GET /api/tags
     * Get all tags or filter by type
     * Example: /api/tags?type=CATEGORY
     */
    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags(
            @RequestParam(required = false) TagType type) {
        List<TagDTO> tags;
        if (type != null) {
            tags = tagService.getTagsByType(type);
        } else {
            tags = tagService.getAllTags();
        }
        return ResponseEntity.ok(tags);
    }

    /**
     * GET /api/tags/{id}
     * Get tag by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<TagDTO> getTagById(@PathVariable Long id) {
        TagDTO tag = tagService.getTagById(id);
        return ResponseEntity.ok(tag);
    }

    /**
     * POST /api/tags
     * Create new tag (Admin only - add security if needed)
     */
    @PostMapping
    public ResponseEntity<TagDTO> createTag(@RequestBody TagRequestDTO requestDTO) {
        TagDTO createdTag = tagService.createTag(requestDTO);
        return new ResponseEntity<>(createdTag, HttpStatus.CREATED);
    }

    /**
     * PUT /api/tags/{id}
     * Update tag (Admin only - add security if needed)
     */
    @PutMapping("/{id}")
    public ResponseEntity<TagDTO> updateTag(
            @PathVariable Long id,
            @RequestBody TagRequestDTO requestDTO) {
        TagDTO updatedTag = tagService.updateTag(id, requestDTO);
        return ResponseEntity.ok(updatedTag);
    }

    /**
     * DELETE /api/tags/{id}
     * Delete tag (Admin only - add security if needed)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/tags/search?q=keyword&type=CATEGORY
     * Search tags by keyword
     */
    @GetMapping("/search")
    public ResponseEntity<List<TagDTO>> searchTags(
            @RequestParam String q,
            @RequestParam(required = false) TagType type) {
        List<TagDTO> tags = tagService.searchTags(q, type);
        return ResponseEntity.ok(tags);
    }

    // ========== INGREDIENT TAG OPERATIONS ==========

    /**
     * GET /api/tags/ingredients/{ingredientId}/tags
     * Get all tags for an ingredient
     */
    @GetMapping("/ingredients/{ingredientId}/tags")
    public ResponseEntity<List<TagDTO>> getIngredientTags(@PathVariable Long ingredientId) {
        List<TagDTO> tags = tagService.getTagsForIngredient(ingredientId);
        return ResponseEntity.ok(tags);
    }

    /**
     * POST /api/tags/ingredients/{ingredientId}/tags
     * Add tags to ingredient
     * Body: { "tagIds": [1, 2, 3] }
     */
    @PostMapping("/ingredients/{ingredientId}/tags")
    public ResponseEntity<Void> addTagsToIngredient(
            @PathVariable Long ingredientId,
            @RequestBody AddTagsToIngredientDTO requestDTO) {
        tagService.addTagsToIngredient(ingredientId, requestDTO.getTagIds());
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/tags/ingredients/{ingredientId}/tags/{tagId}
     * Remove tag from ingredient
     */
    @DeleteMapping("/ingredients/{ingredientId}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromIngredient(
            @PathVariable Long ingredientId,
            @PathVariable Long tagId) {
        tagService.removeTagFromIngredient(ingredientId, tagId);
        return ResponseEntity.noContent().build();
    }
}
