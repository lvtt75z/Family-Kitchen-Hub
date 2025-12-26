package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.CommentMediaRequestDTO;
import com.c2se04.familykitchenhub.DTO.Request.RecipeCommentRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.CommentMediaResponseDTO;
import com.c2se04.familykitchenhub.DTO.Response.RecipeCommentResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.RecipeCommentRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.enums.CommentStatus;
import com.c2se04.familykitchenhub.enums.MediaType;
import com.c2se04.familykitchenhub.model.CommentMedia;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeComment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecipeCommentService {

    private final RecipeCommentRepository recipeCommentRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final CommentReactionService commentReactionService;

    @Autowired
    public RecipeCommentService(RecipeCommentRepository recipeCommentRepository,
            RecipeRepository recipeRepository,
            UserRepository userRepository,
            CommentReactionService commentReactionService) {
        this.recipeCommentRepository = recipeCommentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
        this.commentReactionService = commentReactionService;
    }

    @Transactional
    public RecipeCommentResponseDTO createComment(Long recipeId, RecipeCommentRequestDTO request) {
        if (request == null || request.getUserId() == null) {
            throw new BadRequestException("Thiếu userId khi tạo bình luận");
        }
        if (!StringUtils.hasText(request.getContent())) {
            throw new BadRequestException("Nội dung bình luận không được trống");
        }

        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        RecipeComment comment = new RecipeComment();
        comment.setRecipe(recipe);
        comment.setUser(user);
        comment.setContent(request.getContent().trim());
        comment.setStatus(CommentStatus.PENDING);

        // Set parent comment for replies
        if (request.getParentCommentId() != null) {
            RecipeComment parentComment = recipeCommentRepository.findById(request.getParentCommentId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("ParentComment", "id", request.getParentCommentId()));
            comment.setParent(parentComment);
        }

        if (!CollectionUtils.isEmpty(request.getMedia())) {
            for (CommentMediaRequestDTO mediaRequest : request.getMedia()) {
                if (mediaRequest == null || !StringUtils.hasText(mediaRequest.getUrl())) {
                    continue;
                }
                CommentMedia media = new CommentMedia();
                media.setUrl(mediaRequest.getUrl());
                MediaType mediaType = mediaRequest.getType() != null ? mediaRequest.getType() : MediaType.IMAGE;
                media.setType(mediaType);
                comment.addMedia(media);
            }
        }

        RecipeComment saved = recipeCommentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RecipeCommentResponseDTO> getComments(Long recipeId, CommentStatus status) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        List<RecipeComment> comments;
        if (status != null) {
            comments = recipeCommentRepository.findByRecipeAndStatusOrderByCreatedAtDesc(recipe, status);
        } else {
            comments = recipeCommentRepository.findByRecipeOrderByCreatedAtDesc(recipe);
        }

        return comments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // Overloaded method with userId to include currentUserReaction
    @Transactional(readOnly = true)
    public List<RecipeCommentResponseDTO> getComments(Long recipeId, CommentStatus status, Long userId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        List<RecipeComment> comments;
        if (status != null) {
            comments = recipeCommentRepository.findByRecipeAndStatusOrderByCreatedAtDesc(recipe, status);
        } else {
            comments = recipeCommentRepository.findByRecipeOrderByCreatedAtDesc(recipe);
        }

        // If userId is provided, use mapToResponse with userId to include
        // currentUserReaction
        if (userId != null) {
            return comments.stream().map(c -> mapToResponse(c, userId)).collect(Collectors.toList());
        } else {
            return comments.stream().map(this::mapToResponse).collect(Collectors.toList());
        }
    }

    @Transactional
    public RecipeCommentResponseDTO updateStatus(Long commentId, CommentStatus status) {
        if (status == null) {
            throw new BadRequestException("Status không hợp lệ");
        }

        RecipeComment comment = recipeCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeComment", "id", commentId));
        comment.setStatus(status);
        RecipeComment saved = recipeCommentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional
    public RecipeCommentResponseDTO updateComment(Long commentId, RecipeCommentRequestDTO request) {
        if (request == null || request.getUserId() == null) {
            throw new BadRequestException("Thiếu userId khi cập nhật bình luận");
        }
        if (!StringUtils.hasText(request.getContent())) {
            throw new BadRequestException("Nội dung bình luận không được trống");
        }

        RecipeComment comment = recipeCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeComment", "id", commentId));

        // Validate user owns the comment
        if (!comment.getUser().getId().equals(request.getUserId())) {
            throw new BadRequestException("Bạn không có quyền chỉnh sửa bình luận này");
        }

        // Update content
        comment.setContent(request.getContent().trim());

        // Update media if provided
        if (request.getMedia() != null) {
            comment.clearMedia();
            for (CommentMediaRequestDTO mediaRequest : request.getMedia()) {
                if (mediaRequest == null || !StringUtils.hasText(mediaRequest.getUrl())) {
                    continue;
                }
                CommentMedia media = new CommentMedia();
                media.setUrl(mediaRequest.getUrl());
                MediaType mediaType = mediaRequest.getType() != null ? mediaRequest.getType() : MediaType.IMAGE;
                media.setType(mediaType);
                comment.addMedia(media);
            }
        }

        RecipeComment saved = recipeCommentRepository.save(comment);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        if (userId == null) {
            throw new BadRequestException("Thiếu userId khi xóa bình luận");
        }

        RecipeComment comment = recipeCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeComment", "id", commentId));

        // Validate user owns the comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new BadRequestException("Bạn không có quyền xóa bình luận này");
        }

        recipeCommentRepository.delete(comment);
    }

    private RecipeCommentResponseDTO mapToResponse(RecipeComment comment) {
        RecipeCommentResponseDTO dto = new RecipeCommentResponseDTO();
        dto.setId(comment.getId());
        dto.setRecipeId(comment.getRecipe().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setUserFullName(comment.getUser().getFullName());
        dto.setContent(comment.getContent());
        dto.setStatus(comment.getStatus());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        // Map media
        List<CommentMediaResponseDTO> mediaResponses = comment.getMedia()
                .stream()
                .map(media -> new CommentMediaResponseDTO(media.getId(), media.getUrl(), media.getType()))
                .collect(Collectors.toList());
        dto.setMedia(mediaResponses);

        // Set parent ID for replies
        if (comment.getParent() != null) {
            dto.setParentId(comment.getParent().getId());
        }

        // Set reply count
        dto.setReplyCount(comment.getReplies().size());

        // Set reaction counts
        dto.setReactionCounts(commentReactionService.getReactionCounts(comment.getId()));

        return dto;
    }

    // Overloaded method to include current user's reaction
    private RecipeCommentResponseDTO mapToResponse(RecipeComment comment, Long currentUserId) {
        RecipeCommentResponseDTO dto = mapToResponse(comment);
        if (currentUserId != null) {
            dto.setCurrentUserReaction(commentReactionService.getCurrentUserReaction(comment.getId(), currentUserId));
        }
        return dto;
    }
}
