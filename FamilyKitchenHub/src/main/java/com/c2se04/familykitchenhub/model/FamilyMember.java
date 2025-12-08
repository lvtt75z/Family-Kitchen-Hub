package com.c2se04.familykitchenhub.model;

import com.c2se04.familykitchenhub.enums.Gender;
import com.c2se04.familykitchenhub.enums.ActivityLevel;
import com.c2se04.familykitchenhub.Entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "family_members")
public class FamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "age")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "height_cm")
    private Float heightCm;

    @Column(name = "weight_kg")
    private Float weightKg;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_level")
    private ActivityLevel activityLevel;

    @Column(name = "is_account_owner")
    private Boolean isAccountOwner = false;

    @Column(name = "taste_preferences", columnDefinition = "TEXT")
    private String tastePreferences;

    @Column(name = "health_conditions", columnDefinition = "TEXT")
    private String healthConditions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // KẾT NỐI VỚI BẢNG ALLERGIES ---
    // Quan hệ Many-to-Many thông qua bảng trung gian 'member_allergies'
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "member_allergies", // Tên bảng trung gian trong SQL
            joinColumns = @JoinColumn(name = "member_id"), // Khóa ngoại trỏ về FamilyMember
            inverseJoinColumns = @JoinColumn(name = "allergy_id") // Khóa ngoại trỏ về Allergy
    )
    private Set<Allergy> allergies = new HashSet<>();

    // --- Constructors ---
    public FamilyMember() {}

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public Float getHeightCm() { return heightCm; }
    public void setHeightCm(Float heightCm) { this.heightCm = heightCm; }

    public Float getWeightKg() { return weightKg; }
    public void setWeightKg(Float weightKg) { this.weightKg = weightKg; }

    public ActivityLevel getActivityLevel() { return activityLevel; }
    public void setActivityLevel(ActivityLevel activityLevel) { this.activityLevel = activityLevel; }

    public Boolean getIsAccountOwner() { return isAccountOwner; }
    public void setIsAccountOwner(Boolean accountOwner) { isAccountOwner = accountOwner; }

    public String getTastePreferences() { return tastePreferences; }
    public void setTastePreferences(String tastePreferences) { this.tastePreferences = tastePreferences; }

    public String getHealthConditions() { return healthConditions; }
    public void setHealthConditions(String healthConditions) { this.healthConditions = healthConditions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Allergy> getAllergies() {
        return allergies;
    }

    public void setAllergies(Set<Allergy> allergies) {
        this.allergies = allergies;
    }
}