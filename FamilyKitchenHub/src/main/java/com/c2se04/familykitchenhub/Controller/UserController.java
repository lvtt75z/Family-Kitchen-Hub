package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.UserRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.UserResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
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

    // Helper method để chuyển đổi Entity -> Response DTO
    private UserResponseDTO convertToDto(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        BeanUtils.copyProperties(user, dto);
        // KHÔNG copy trường password
        return dto;
    }

    // POST /api/users - CREATE
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO userDTO) {
        User user = new User();
        BeanUtils.copyProperties(userDTO, user); // Copy tất cả, kể cả mật khẩu (sau này cần mã hóa)

        User newUser = userService.createUser(user);
        return new ResponseEntity<>(convertToDto(newUser), HttpStatus.CREATED);
    }

    // GET /api/users - READ ALL
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserResponseDTO> dtos = users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET /api/users/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToDto(user));
    }

    // PUT /api/users/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UserRequestDTO userDTO) {
        User updateDetails = new User();
        // Chỉ copy các trường có thể cập nhật
        updateDetails.setFullName(userDTO.getFullName());
        updateDetails.setEmail(userDTO.getEmail());
        // Bỏ qua password, username và role trong logic cập nhật đơn giản này

        User updatedUser = userService.updateUser(id, updateDetails);
        return ResponseEntity.ok(convertToDto(updatedUser));
    }

    // DELETE /api/users/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}