package com.c2se04.familykitchenhub.DTO.Request;

import com.c2se04.familykitchenhub.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class UserRequestDTO {

    @NotBlank
    private String username;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password; // Cần thiết khi tạo user

    private String fullName;

    @NotNull
    private Role role; // Sử dụng Role enum

    // --- Constructors, Getters, and Setters ---
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    // ... (Thêm getters/setters cho các trường còn lại)
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}