package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.RecipeCommentRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.RecipeCommentResponseDTO;
import com.c2se04.familykitchenhub.Service.RecipeCommentService;
import com.c2se04.familykitchenhub.enums.CommentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeCommentController {

    private final RecipeCommentService recipeCommentService;

    @Autowired
    public RecipeCommentController(RecipeCommentService recipeCommentService) {
        this.recipeCommentService = recipeCommentService;
    }

    @PostMapping("/{recipeId}/comments")
    public ResponseEntity<RecipeCommentResponseDTO> createComment(@PathVariable Long recipeId,
                                                                  @RequestBody RecipeCommentRequestDTO request) {
        return ResponseEntity.ok(recipeCommentService.createComment(recipeId, request));
    }

    @GetMapping("/{recipeId}/comments")
    public ResponseEntity<List<RecipeCommentResponseDTO>> listComments(@PathVariable Long recipeId,
                                                                       @RequestParam(required = false) CommentStatus status) {
        return ResponseEntity.ok(recipeCommentService.getComments(recipeId, status));
    }

    @PatchMapping("/comments/{commentId}/status")
    public ResponseEntity<RecipeCommentResponseDTO> updateStatus(@PathVariable Long commentId,
                                                                 @RequestParam CommentStatus status) {
        return ResponseEntity.ok(recipeCommentService.updateStatus(commentId, status));
    }
}

