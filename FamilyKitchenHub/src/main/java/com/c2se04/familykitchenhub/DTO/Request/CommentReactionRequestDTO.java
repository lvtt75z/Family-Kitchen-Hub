package com.c2se04.familykitchenhub.DTO.Request;

import com.c2se04.familykitchenhub.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

public class CommentReactionRequestDTO {

    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType;

    public ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(ReactionType reactionType) {
        this.reactionType = reactionType;
    }
}
