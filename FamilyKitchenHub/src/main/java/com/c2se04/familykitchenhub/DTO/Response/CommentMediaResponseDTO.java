package com.c2se04.familykitchenhub.DTO.Response;

import com.c2se04.familykitchenhub.enums.MediaType;

public class CommentMediaResponseDTO {

    private Long id;
    private String url;
    private MediaType type;

    public CommentMediaResponseDTO() {
    }

    public CommentMediaResponseDTO(Long id, String url, MediaType type) {
        this.id = id;
        this.url = url;
        this.type = type;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }
}

