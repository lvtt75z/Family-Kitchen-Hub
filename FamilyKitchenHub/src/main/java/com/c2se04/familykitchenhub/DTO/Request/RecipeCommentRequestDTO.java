package com.c2se04.familykitchenhub.DTO.Request;

import java.util.ArrayList;
import java.util.List;

public class RecipeCommentRequestDTO {

    private Long userId;
    private String content;
    private List<CommentMediaRequestDTO> media = new ArrayList<>();

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<CommentMediaRequestDTO> getMedia() {
        return media;
    }

    public void setMedia(List<CommentMediaRequestDTO> media) {
        this.media = media;
    }
}

