package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.CommentReactionRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.CommentReactionResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Service.CommentReactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentReactionController {

    @Autowired
    private CommentReactionService commentReactionService;

    @PostMapping("/{commentId}/reactions")
    public ResponseEntity<CommentReactionResponseDTO> addOrUpdateReaction(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentReactionRequestDTO request,
            @AuthenticationPrincipal User user) {
        CommentReactionResponseDTO response = commentReactionService
                .addOrUpdateReaction(commentId, request, user);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{commentId}/reactions")
    public ResponseEntity<Void> removeReaction(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user) {
        commentReactionService.removeReaction(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{commentId}/reactions")
    public ResponseEntity<List<CommentReactionResponseDTO>> getReactions(
            @PathVariable Long commentId) {
        List<CommentReactionResponseDTO> reactions = commentReactionService
                .getReactionsByCommentId(commentId);
        return ResponseEntity.ok(reactions);
    }

    @GetMapping("/{commentId}/reactions/counts")
    public ResponseEntity<Map<String, Long>> getReactionCounts(
            @PathVariable Long commentId) {
        Map<String, Long> counts = commentReactionService.getReactionCounts(commentId);
        return ResponseEntity.ok(counts);
    }
}
