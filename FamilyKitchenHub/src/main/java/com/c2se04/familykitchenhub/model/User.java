package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    /**
     * The unique, auto-incrementing identifier for each user.
     * Maps to the 'id' primary key column.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user's unique username for login.
     */
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    /**
     * The user's unique email address.
     */
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    /**
     * The user's hashed password.
     * The column name "password_" matches the database design.
     */
    @Column(name = "password_")
    private String password;

    /**
     * The full name of the user.
     */
    @Column(name = "full_name")
    private String fullName;

    /**
     * The role of the user, stored as a string ('FAMILY_USER' or 'ADMIN').
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    /**
     * The timestamp when the user account was created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // This method is called before the entity is saved for the first time.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // --- Constructors, Getters, and Setters ---

    public User() {
    }
    // Getters and Setters for all fields
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
