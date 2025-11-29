package com.c2se04.familykitchenhub.DTO.Response;

import com.c2se04.familykitchenhub.enums.MediaType;

public class MediaUploadResponseDTO {

    private String fileName;
    private String url;
    private long size;
    private MediaType type;

    public MediaUploadResponseDTO() {
    }

    public MediaUploadResponseDTO(String fileName, String url, long size, MediaType type) {
        this.fileName = fileName;
        this.url = url;
        this.size = size;
        this.type = type;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }
}

