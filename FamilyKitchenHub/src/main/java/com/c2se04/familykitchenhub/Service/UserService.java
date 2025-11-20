package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE: Đăng ký người dùng mới
    @Transactional
    public User createUser(User user) {
        // Trong một ứng dụng thực tế, bạn sẽ MÃ HÓA mật khẩu ở đây
        // Ví dụ: user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Kiểm tra tính duy nhất (tránh lỗi duplicate key từ DB)
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại.");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại.");
        }

        return userRepository.save(user);
    }

    // READ ALL: Lấy tất cả người dùng
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // READ BY ID: Lấy thông tin người dùng theo ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    // UPDATE: Cập nhật thông tin người dùng
    @Transactional
    public User updateUser(Long id, User updatedDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Cập nhật các trường được phép
        existingUser.setFullName(updatedDetails.getFullName());
        existingUser.setEmail(updatedDetails.getEmail());
        // LƯU Ý: Không cập nhật mật khẩu ở đây, nên có một phương thức riêng

        return userRepository.save(existingUser);
    }

    // UPDATE PROFILE: Cập nhật thông tin profile người dùng
    @Transactional
    public User updateProfile(Long id, User profileDetails) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Cập nhật các trường profile
        if (profileDetails.getFullName() != null) {
            existingUser.setFullName(profileDetails.getFullName());
        }
        if (profileDetails.getGender() != null) {
            existingUser.setGender(profileDetails.getGender());
        }
        if (profileDetails.getPathology() != null) {
            existingUser.setPathology(profileDetails.getPathology());
        }
        if (profileDetails.getEmail() != null) {
            existingUser.setEmail(profileDetails.getEmail());
        }
        if (profileDetails.getNumberOfFamilyMembers() != null) {
            existingUser.setNumberOfFamilyMembers(profileDetails.getNumberOfFamilyMembers());
        }
        if (profileDetails.getCountry() != null) {
            existingUser.setCountry(profileDetails.getCountry());
        }
        if (profileDetails.getFavorite() != null) {
            existingUser.setFavorite(profileDetails.getFavorite());
        }
        if (profileDetails.getAgeGroupsChildren() != null) {
            existingUser.setAgeGroupsChildren(profileDetails.getAgeGroupsChildren());
        }
        if (profileDetails.getAgeGroupsTeenagers() != null) {
            existingUser.setAgeGroupsTeenagers(profileDetails.getAgeGroupsTeenagers());
        }
        if (profileDetails.getAgeGroupsAdult() != null) {
            existingUser.setAgeGroupsAdult(profileDetails.getAgeGroupsAdult());
        }
        if (profileDetails.getAgeGroupsOldPerson() != null) {
            existingUser.setAgeGroupsOldPerson(profileDetails.getAgeGroupsOldPerson());
        }

        return userRepository.save(existingUser);
    }

    // DELETE: Xóa người dùng
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }
}