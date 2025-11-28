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

    @Autowired
    public RecipeCommentService(RecipeCommentRepository recipeCommentRepository,
                                RecipeRepository recipeRepository,
                                UserRepository userRepository) {
        this.recipeCommentRepository = recipeCommentRepository;
        this.recipeRepository = recipeRepository;
        this.userRepository = userRepository;
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

    private RecipeCommentResponseDTO mapToResponse(RecipeComment comment) {
        RecipeCommentResponseDTO dto = new RecipeCommentResponseDTO();
        dto.setId(comment.getId());
        dto.setRecipeId(comment.getRecipe().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setContent(comment.getContent());
        dto.setStatus(comment.getStatus());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        List<CommentMediaResponseDTO> mediaResponses = comment.getMedia()
                .stream()
                .map(media -> new CommentMediaResponseDTO(media.getId(), media.getUrl(), media.getType()))
                .collect(Collectors.toList());
        dto.setMedia(mediaResponses);
        return dto;
    }
}

