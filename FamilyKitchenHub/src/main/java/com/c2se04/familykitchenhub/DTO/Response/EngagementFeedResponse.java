package com.c2se04.familykitchenhub.DTO.Response;

import java.util.List;

public class EngagementFeedResponse {

    private List<RecipeEngagementResponseDTO> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean cacheable;

    public EngagementFeedResponse() {
    }

    public EngagementFeedResponse(List<RecipeEngagementResponseDTO> items,
                                  int page,
                                  int size,
                                  long totalElements,
                                  int totalPages,
                                  boolean cacheable) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.cacheable = cacheable;
    }

    public List<RecipeEngagementResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<RecipeEngagementResponseDTO> items) {
        this.items = items;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isCacheable() {
        return cacheable;
    }

    public void setCacheable(boolean cacheable) {
        this.cacheable = cacheable;
    }
}

