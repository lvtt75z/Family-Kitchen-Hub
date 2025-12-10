package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.EditProfileRequestDTO;
import com.c2se04.familykitchenhub.DTO.Request.UserRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.EditProfileResponseDTO;
import com.c2se04.familykitchenhub.DTO.Response.UserResponseDTO;
import com.c2se04.familykitchenhub.Entity.User; // Import từ model (entity đã chuẩn hóa)
import com.c2se04.familykitchenhub.Service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Helper: Entity -> Response DTO
    private UserResponseDTO convertToDto(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        // Chỉ copy các trường cơ bản: id, username, email, fullName, role
        BeanUtils.copyProperties(user, dto);
        return dto;
    }

    // 1. CREATE USER (Đăng ký tài khoản)
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO userDTO) {
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword());
        user.setFullName(userDTO.getFullName());

        // Lưu ý: UserService cần xử lý việc tạo 1 FamilyMember mặc định (Chủ hộ)
        User newUser = userService.createUser(user);
        return new ResponseEntity<>(convertToDto(newUser), HttpStatus.CREATED);
    }

    // 2. GET ALL USERS (Dành cho Admin)
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponseDTO> dtos = users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // 3. GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToDto(user));
    }

    // 4. UPDATE USER (Chỉ update thông tin tài khoản: Email, FullName)
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserRequestDTO userDTO) {
        User updateDetails = new User();
        updateDetails.setFullName(userDTO.getFullName());
        updateDetails.setEmail(userDTO.getEmail());

        // Không cho phép update username/password tại endpoint này
        User updatedUser = userService.updateUser(id, updateDetails);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    // 5. DELETE USER
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // 6. GET USER PROFILE
    @GetMapping("/{id}/profile")
    public ResponseEntity<EditProfileResponseDTO> getUserProfile(@PathVariable Long id) {
        EditProfileResponseDTO profile = userService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    // 7. UPDATE USER PROFILE
    @PutMapping("/{id}/profile")
    public ResponseEntity<EditProfileResponseDTO> updateUserProfile(
            @PathVariable Long id,
            @RequestBody EditProfileRequestDTO requestDTO) {
        EditProfileResponseDTO updatedProfile = userService.updateProfile(id, requestDTO);
        return ResponseEntity.ok(updatedProfile);
    }
}