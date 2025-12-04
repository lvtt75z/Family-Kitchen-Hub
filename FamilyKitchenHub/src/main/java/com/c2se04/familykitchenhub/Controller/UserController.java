package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.EditProfileRequestDTO;
import com.c2se04.familykitchenhub.DTO.Request.UserRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.EditProfileResponseDTO;
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

    // Helper method để chuyển đổi EditProfileRequestDTO -> User Entity
    private User convertEditProfileRequestToUser(EditProfileRequestDTO requestDTO) {
        User user = new User();
        user.setFullName(requestDTO.getFullName());
        user.setGender(requestDTO.getGender());
        user.setPathology(requestDTO.getPathology());
        user.setEmail(requestDTO.getEmail());
        user.setNumberOfFamilyMembers(requestDTO.getNumberOfFamilyMembers());
        user.setCountry(requestDTO.getCountry());
        user.setFavorite(requestDTO.getFavorite());
        
        if (requestDTO.getAgeGroups() != null) {
            user.setAgeGroupsChildren(requestDTO.getAgeGroups().getChildren());
            user.setAgeGroupsTeenagers(requestDTO.getAgeGroups().getTeenagers());
            user.setAgeGroupsAdult(requestDTO.getAgeGroups().getAdult());
            user.setAgeGroupsOldPerson(requestDTO.getAgeGroups().getOldPerson());
        }
        
        return user;
    }

    // Helper method để chuyển đổi User Entity -> EditProfileResponseDTO
    private EditProfileResponseDTO convertUserToEditProfileResponse(User user) {
        EditProfileResponseDTO responseDTO = new EditProfileResponseDTO();
        responseDTO.setId(user.getId());
        responseDTO.setFullName(user.getFullName());
        responseDTO.setGender(user.getGender());
        responseDTO.setPathology(user.getPathology());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setNumberOfFamilyMembers(user.getNumberOfFamilyMembers());
        responseDTO.setCountry(user.getCountry());
        responseDTO.setFavorite(user.getFavorite());
        
        EditProfileResponseDTO.AgeGroupsDTO ageGroups = new EditProfileResponseDTO.AgeGroupsDTO();
        ageGroups.setChildren(user.getAgeGroupsChildren());
        ageGroups.setTeenagers(user.getAgeGroupsTeenagers());
        ageGroups.setAdult(user.getAgeGroupsAdult());
        ageGroups.setOldPerson(user.getAgeGroupsOldPerson());
        responseDTO.setAgeGroups(ageGroups);
        
        return responseDTO;
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

    // GET /api/users/{id}/profile - READ PROFILE DETAILS
    @GetMapping("/{id}/profile")
    public ResponseEntity<EditProfileResponseDTO> getProfile(@PathVariable Long id) {
        User user = userService.getUserById(id);
        EditProfileResponseDTO responseDTO = convertUserToEditProfileResponse(user);
        return ResponseEntity.ok(responseDTO);
    }

    // GET /api/users/{id}/username - PUBLIC: get username only
    @GetMapping("/{id}/username")
    public ResponseEntity<String> getUsernameById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(user.getUsername());
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

    // PUT /api/users/{id}/profile - UPDATE PROFILE
    @PutMapping("/{id}/profile")
    public ResponseEntity<EditProfileResponseDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody EditProfileRequestDTO profileDTO) {
        // Chuyển đổi DTO -> Entity
        User profileDetails = convertEditProfileRequestToUser(profileDTO);
        
        // Cập nhật profile
        User updatedUser = userService.updateProfile(id, profileDetails);
        
        // Chuyển đổi Entity -> Response DTO
        EditProfileResponseDTO responseDTO = convertUserToEditProfileResponse(updatedUser);
        
        return ResponseEntity.ok(responseDTO); // 200 OK
    }
}