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
}