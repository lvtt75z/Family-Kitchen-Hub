package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.EditProfileRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.EditProfileResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.Repository.FamilyMemberRepository;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.enums.Gender;
import com.c2se04.familykitchenhub.model.FamilyMember;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;

    @Autowired
    public UserService(UserRepository userRepository, FamilyMemberRepository familyMemberRepository) {
        this.userRepository = userRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    // CREATE: Đăng ký người dùng mới
    @Transactional
    public User createUser(User user) {
        // Kiểm tra tính duy nhất
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại.");
        }
        return userRepository.save(user);
    }

    // READ ALL
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ BY ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    // UPDATE: Chỉ cập nhật thông tin tài khoản cơ bản (Email, Tên)
    @Transactional
    public User updateUser(Long id, User updatedDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Chỉ cập nhật các trường còn tồn tại trong Entity User
        if (updatedDetails.getFullName() != null) {
            existingUser.setFullName(updatedDetails.getFullName());
        }
        if (updatedDetails.getEmail() != null) {
            existingUser.setEmail(updatedDetails.getEmail());
        }
        return userRepository.save(existingUser);
    }
    
    // DELETE
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    // GET PROFILE
    @Transactional(readOnly = true)
    public EditProfileResponseDTO getProfile(Long userId) {
        User user = getUserById(userId);
        List<FamilyMember> familyMembers = familyMemberRepository.findByUserId(userId);
        
        // Find account owner - handle null isAccountOwner safely
        FamilyMember accountOwner = null;
        if (familyMembers != null && !familyMembers.isEmpty()) {
            accountOwner = familyMembers.stream()
                    .filter(member -> member.getIsAccountOwner() != null && member.getIsAccountOwner())
                    .findFirst()
                    .orElse(familyMembers.get(0)); // Use first member if no account owner found
        }
        
        EditProfileResponseDTO response = new EditProfileResponseDTO();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setCountry(user.getCountry());
        response.setNumberOfFamilyMembers(familyMembers != null ? familyMembers.size() : 0);
        
        if (accountOwner != null) {
            // Convert Gender enum to string
            if (accountOwner.getGender() != null) {
                response.setGender(accountOwner.getGender().name().toLowerCase());
            }
            // healthConditions -> pathology
            response.setPathology(accountOwner.getHealthConditions());
            // tastePreferences -> favorite
            response.setFavorite(accountOwner.getTastePreferences());
        }
        
        // Calculate age groups from family members
        EditProfileResponseDTO.AgeGroupsDTO ageGroups = new EditProfileResponseDTO.AgeGroupsDTO();
        if (familyMembers != null) {
            for (FamilyMember member : familyMembers) {
                if (member != null && member.getAge() != null) {
                    int age = member.getAge();
                    if (age >= 1 && age <= 12) {
                        ageGroups.setChildren(true);
                    } else if (age >= 13 && age <= 18) {
                        ageGroups.setTeenagers(true);
                    } else if (age >= 19 && age <= 60) {
                        ageGroups.setAdult(true);
                    } else if (age > 60) {
                        ageGroups.setOldPerson(true);
                    }
                }
            }
        }
        response.setAgeGroups(ageGroups);
        
        return response;
    }

    // UPDATE PROFILE
    @Transactional
    public EditProfileResponseDTO updateProfile(Long userId, EditProfileRequestDTO requestDTO) {
        User user = getUserById(userId);
        
        // Update User fields
        if (requestDTO.getFullName() != null) {
            user.setFullName(requestDTO.getFullName());
        }
        if (requestDTO.getEmail() != null) {
            user.setEmail(requestDTO.getEmail());
        }
        if (requestDTO.getCountry() != null) {
            user.setCountry(requestDTO.getCountry());
        }
        user = userRepository.save(user);
        
        // Find or create account owner - handle null isAccountOwner safely
        List<FamilyMember> familyMembers = familyMemberRepository.findByUserId(userId);
        FamilyMember accountOwner = null;
        if (familyMembers != null && !familyMembers.isEmpty()) {
            accountOwner = familyMembers.stream()
                    .filter(member -> member.getIsAccountOwner() != null && member.getIsAccountOwner())
                    .findFirst()
                    .orElse(null);
        }
        
        if (accountOwner == null) {
            // Create new account owner if doesn't exist
            accountOwner = new FamilyMember();
            accountOwner.setUser(user);
            accountOwner.setName(user.getFullName() != null ? user.getFullName() : user.getUsername());
            accountOwner.setIsAccountOwner(true);
        }
        
        // Update account owner fields
        if (requestDTO.getGender() != null && !requestDTO.getGender().trim().isEmpty()) {
            try {
                accountOwner.setGender(Gender.valueOf(requestDTO.getGender().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Invalid gender value, skip
            }
        }
        if (requestDTO.getPathology() != null) {
            accountOwner.setHealthConditions(requestDTO.getPathology());
        }
        if (requestDTO.getFavorite() != null) {
            accountOwner.setTastePreferences(requestDTO.getFavorite());
        }
        
        familyMemberRepository.save(accountOwner);
        
        // Return updated profile
        return getProfile(userId);
    }
}