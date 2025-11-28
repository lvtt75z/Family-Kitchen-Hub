package com.c2se04.familykitchenhub.DTO.Request;

import com.c2se04.familykitchenhub.enums.MediaType;

public class CommentMediaRequestDTO {

    private String url;
    private MediaType type = MediaType.IMAGE;

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

