package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.CommentReactionRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.CommentReactionResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Repository.CommentReactionRepository;
import com.c2se04.familykitchenhub.Repository.RecipeCommentRepository;
import com.c2se04.familykitchenhub.model.CommentReaction;
import com.c2se04.familykitchenhub.model.RecipeComment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentReactionService {

    @Autowired
    private CommentReactionRepository commentReactionRepository;

    @Autowired
    private RecipeCommentRepository recipeCommentRepository;

    @Transactional
    public CommentReactionResponseDTO addOrUpdateReaction(Long commentId, CommentReactionRequestDTO request,
            User user) {
        RecipeComment comment = recipeCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        Optional<CommentReaction> existingReaction = commentReactionRepository
                .findByCommentIdAndUserId(commentId, user.getId());

        CommentReaction reaction;
        if (existingReaction.isPresent()) {
            // Update existing reaction
            reaction = existingReaction.get();
            reaction.setReactionType(request.getReactionType());
        } else {
            // Create new reaction
            reaction = new CommentReaction();
            reaction.setComment(comment);
            reaction.setUser(user);
            reaction.setReactionType(request.getReactionType());
        }

        reaction = commentReactionRepository.save(reaction);
        return mapToResponseDTO(reaction);
    }

    @Transactional
    public void removeReaction(Long commentId, Long userId) {
        commentReactionRepository.deleteByCommentIdAndUserId(commentId, userId);
    }

    public List<CommentReactionResponseDTO> getReactionsByCommentId(Long commentId) {
        List<CommentReaction> reactions = commentReactionRepository.findByCommentId(commentId);
        return reactions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Long> getReactionCounts(Long commentId) {
        List<CommentReactionRepository.ReactionCount> counts = commentReactionRepository
                .countByCommentIdGroupByReactionType(commentId);

        Map<String, Long> reactionCounts = new HashMap<>();
        for (CommentReactionRepository.ReactionCount count : counts) {
            reactionCounts.put(count.getType().name(), count.getCount());
        }
        return reactionCounts;
    }

    public String getCurrentUserReaction(Long commentId, Long userId) {
        Optional<CommentReaction> reaction = commentReactionRepository
                .findByCommentIdAndUserId(commentId, userId);
        return reaction.map(r -> r.getReactionType().name()).orElse(null);
    }

    private CommentReactionResponseDTO mapToResponseDTO(CommentReaction reaction) {
        CommentReactionResponseDTO dto = new CommentReactionResponseDTO();
        dto.setId(reaction.getId());
        dto.setCommentId(reaction.getComment().getId());
        dto.setUserId(reaction.getUser().getId());
        dto.setUsername(reaction.getUser().getUsername());
        dto.setReactionType(reaction.getReactionType());
        dto.setCreatedAt(reaction.getCreatedAt());
        return dto;
    }
}
