package com.c2se04.familykitchenhub.DTO.Response;

/**
 * Hot search keyword DTO
 */
public class HotSearchDTO {

    private String keyword;
    private Long count;

    public HotSearchDTO() {
    }

    public HotSearchDTO(String keyword, Long count) {
        this.keyword = keyword;
        this.count = count;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
