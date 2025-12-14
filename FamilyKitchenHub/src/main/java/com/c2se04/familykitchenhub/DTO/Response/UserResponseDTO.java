package com.c2se04.familykitchenhub.DTO.Response;

import com.c2se04.familykitchenhub.enums.Role;
import java.time.LocalDateTime;

public class UserResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private String country;
    private LocalDateTime createdAt;

    // --- Constructors, Getters, and Setters ---
    // ... (Thêm getters/setters cho tất cả các trường, **KHÔNG CÓ PASSWORD**)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}