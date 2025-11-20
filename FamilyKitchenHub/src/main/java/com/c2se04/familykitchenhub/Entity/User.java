package com.c2se04.familykitchenhub.Entity;

import com.c2se04.familykitchenhub.Enum.Role;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "password_")
    private String password;
    
    @Column(name = "full_name")
    private String fullName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verification_code")
    private String verificationCode;
    
    @Column(name = "verification_code_expiry")
    private LocalDateTime verificationCodeExpiry;
    
    @Column(name = "reset_token")
    private String resetToken;
    
    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;
    
    // Profile fields
    @Column(name = "gender")
    private String gender;
    
    @Column(name = "pathology")
    private String pathology; // allergy, diabetes, hypertension, none
    
    @Column(name = "number_of_family_members")
    private Integer numberOfFamilyMembers;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "favorite")
    private String favorite; // Vegetarian, Vegan, Meat Lover, Balanced
    
    @Column(name = "age_groups_children")
    private Boolean ageGroupsChildren = false;
    
    @Column(name = "age_groups_teenagers")
    private Boolean ageGroupsTeenagers = false;
    
    @Column(name = "age_groups_adult")
    private Boolean ageGroupsAdult = false;
    
    @Column(name = "age_groups_old_person")
    private Boolean ageGroupsOldPerson = false;

    // Constructors
    public User() {
    }

    public User(Long id, String username, String email, String password, String fullName, Role role, 
                LocalDateTime createdAt, Boolean isVerified, String verificationCode, 
                LocalDateTime verificationCodeExpiry, String resetToken, LocalDateTime resetTokenExpiry) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.createdAt = createdAt;
        this.isVerified = isVerified;
        this.verificationCode = verificationCode;
        this.verificationCodeExpiry = verificationCodeExpiry;
        this.resetToken = resetToken;
        this.resetTokenExpiry = resetTokenExpiry;
    }

    // Getters and Setters
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

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public LocalDateTime getVerificationCodeExpiry() {
        return verificationCodeExpiry;
    }

    public void setVerificationCodeExpiry(LocalDateTime verificationCodeExpiry) {
        this.verificationCodeExpiry = verificationCodeExpiry;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public LocalDateTime getResetTokenExpiry() {
        return resetTokenExpiry;
    }

    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    
    // Profile getters and setters
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getPathology() {
        return pathology;
    }
    
    public void setPathology(String pathology) {
        this.pathology = pathology;
    }
    
    public Integer getNumberOfFamilyMembers() {
        return numberOfFamilyMembers;
    }
    
    public void setNumberOfFamilyMembers(Integer numberOfFamilyMembers) {
        this.numberOfFamilyMembers = numberOfFamilyMembers;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCountry(String country) {
        this.country = country;
    }
    
    public String getFavorite() {
        return favorite;
    }
    
    public void setFavorite(String favorite) {
        this.favorite = favorite;
    }
    
    public Boolean getAgeGroupsChildren() {
        return ageGroupsChildren;
    }
    
    public void setAgeGroupsChildren(Boolean ageGroupsChildren) {
        this.ageGroupsChildren = ageGroupsChildren;
    }
    
    public Boolean getAgeGroupsTeenagers() {
        return ageGroupsTeenagers;
    }
    
    public void setAgeGroupsTeenagers(Boolean ageGroupsTeenagers) {
        this.ageGroupsTeenagers = ageGroupsTeenagers;
    }
    
    public Boolean getAgeGroupsAdult() {
        return ageGroupsAdult;
    }
    
    public void setAgeGroupsAdult(Boolean ageGroupsAdult) {
        this.ageGroupsAdult = ageGroupsAdult;
    }
    
    public Boolean getAgeGroupsOldPerson() {
        return ageGroupsOldPerson;
    }
    
    public void setAgeGroupsOldPerson(Boolean ageGroupsOldPerson) {
        this.ageGroupsOldPerson = ageGroupsOldPerson;
    }
}
