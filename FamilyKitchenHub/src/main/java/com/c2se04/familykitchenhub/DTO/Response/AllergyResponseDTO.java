package com.c2se04.familykitchenhub.DTO.Response;

public class AllergyResponseDTO {
    private Long id;
    private String name;

    public AllergyResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}