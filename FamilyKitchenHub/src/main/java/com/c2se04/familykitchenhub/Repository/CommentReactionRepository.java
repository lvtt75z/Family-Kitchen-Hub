package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.enums.ReactionType;
import com.c2se04.familykitchenhub.model.CommentReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {

    List<CommentReaction> findByCommentId(Long commentId);

    Optional<CommentReaction> findByCommentIdAndUserId(Long commentId, Long userId);

    void deleteByCommentIdAndUserId(Long commentId, Long userId);

    @Query("SELECT r.reactionType as type, COUNT(r) as count " +
            "FROM CommentReaction r " +
            "WHERE r.comment.id = :commentId " +
            "GROUP BY r.reactionType")
    List<ReactionCount> countByCommentIdGroupByReactionType(Long commentId);

    interface ReactionCount {
        ReactionType getType();

        Long getCount();
    }
}
