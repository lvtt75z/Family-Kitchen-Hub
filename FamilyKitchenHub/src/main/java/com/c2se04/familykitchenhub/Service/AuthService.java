package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.*;
import com.c2se04.familykitchenhub.DTO.Response.AuthResponse;
import com.c2se04.familykitchenhub.DTO.Response.MessageResponse;
import com.c2se04.familykitchenhub.DTO.Response.UserResponse;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Jwt.JwtTokenProvider;
import com.c2se04.familykitchenhub.Mapper.UserMapper;
import com.c2se04.familykitchenhub.Repository.*;
import com.c2se04.familykitchenhub.Util.PasswordUtil;
import com.c2se04.familykitchenhub.Util.ValidationUtil;
import com.c2se04.familykitchenhub.enums.ActivityLevel;
import com.c2se04.familykitchenhub.enums.Gender;
import com.c2se04.familykitchenhub.enums.Role;
import com.c2se04.familykitchenhub.model.FamilyMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final RecipeBookmarkRepository recipeBookmarkRepository;
    private final RecipeCommentRepository recipeCommentRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final RecipeSearchLogRepository recipeSearchLogRepository;
    private final UserNotificationRepository userNotificationRepository;
    private final UserRecipeReminderRepository userRecipeReminderRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final UserMapper userMapper;

    /**
     * 1. REGISTER (Đăng ký & Tạo Profile mặc định)
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        // Validate inputs
        String usernameError = ValidationUtil.getUsernameValidationError(request.getUsername());
        if (usernameError != null)
            throw new BadRequestException(usernameError);

        String passwordError = ValidationUtil.getPasswordValidationError(request.getPassword());
        if (passwordError != null)
            throw new BadRequestException(passwordError);

        if (!request.getPassword().equals(request.getRepeatPassword())) {
            throw new BadRequestException("Password and repeat password do not match");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Tạo OTP
        String otpCode = generateOtpCode();

        // Tạo User
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(PasswordUtil.hashPassword(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(Role.USER);
        user.setIsVerified(false);
        user.setVerificationCode(otpCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(2));

        User savedUser = userRepository.save(user);

        // Tạo Profile FamilyMember chủ hộ
        createDefaultFamilyMemberProfile(savedUser);

        // Gửi Email
        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return new MessageResponse("Registration successful! Please check your email for verification code.", true);
    }

    private void createDefaultFamilyMemberProfile(User user) {
        FamilyMember ownerProfile = new FamilyMember();
        ownerProfile.setUser(user);
        ownerProfile.setName(user.getFullName() != null ? user.getFullName() : "Me");
        ownerProfile.setIsAccountOwner(true);
        ownerProfile.setAge(30);
        ownerProfile.setGender(Gender.MALE);
        ownerProfile.setHeightCm(170.0f);
        ownerProfile.setWeightKg(65.0f);
        ownerProfile.setActivityLevel(ActivityLevel.SEDENTARY);
        familyMemberRepository.save(ownerProfile);
    }

    /**
     * 2. VERIFY EMAIL (Hàm bạn đang bị thiếu)
     */
    @Transactional
    public MessageResponse verifyEmail(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        if (user.getVerificationCode() == null ||
                !user.getVerificationCode().equals(request.getOtpCode())) {
            throw new BadRequestException("Invalid OTP code");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP code has expired");
        }

        user.setIsVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);

        return new MessageResponse("Email verified successfully!", true);
    }

    /**
     * 3. RESEND OTP
     */
    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Email is already verified");
        }

        String otpCode = generateOtpCode();
        user.setVerificationCode(otpCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return new MessageResponse("OTP code has been resent to your email", true);
    }

    /**
     * 4. LOGIN
     */
    public AuthResponse login(LoginRequest request) {
        // Đảm bảo UserRepository có hàm findByUsernameOrEmail
        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail())
                .orElseThrow(() -> new BadRequestException("Invalid username/email or password"));

        if (!PasswordUtil.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username/email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsVerified())) {
            throw new BadRequestException("Please verify your email before logging in");
        }

        String token = jwtTokenProvider.generateToken(user.getUsername());
        UserResponse userResponse = userMapper.toUserResponse(user);

        return new AuthResponse(token, userResponse);
    }

    /**
     * 5. FORGOT PASSWORD
     */
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);

        return new MessageResponse("Password reset instructions have been sent to your email", true);
    }

    /**
     * 6. RESET PASSWORD
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getResetToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        String passwordError = ValidationUtil.getPasswordValidationError(request.getNewPassword());
        if (passwordError != null) {
            throw new BadRequestException(passwordError);
        }

        if (!request.getNewPassword().equals(request.getRepeatPassword())) {
            throw new BadRequestException("Password and repeat password do not match");
        }

        user.setPassword(PasswordUtil.hashPassword(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return new MessageResponse("Password has been reset successfully", true);
    }

    /**
     * 7. GET ALL USERS (Excluding Admins)
     */
    public java.util.List<UserResponse> getAllUsers() {
        java.util.List<User> users = userRepository.findByRole(Role.USER);
        return users.stream()
                .map(userMapper::toUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 8. UPDATE USER
     */
    @Transactional
    public UserResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Update email if provided and different
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        // Update username if provided and different
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            String usernameError = ValidationUtil.getUsernameValidationError(request.getUsername());
            if (usernameError != null)
                throw new BadRequestException(usernameError);

            if (userRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        // Update full name if provided
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        // Update country if provided
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }

        User updatedUser = userRepository.save(user);
        return userMapper.toUserResponse(updatedUser);
    }

    /**
     * 9. DELETE USER (with cascade deletion)
     */
    @Transactional
    public MessageResponse deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Prevent deletion of admin users
        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot delete admin users");
        }

        // Delete all related records (cascade deletion)
        // Note: FamilyMembers will be auto-deleted via JPA cascade settings
        recipeBookmarkRepository.deleteByUser(user);
        recipeCommentRepository.deleteByUser(user);
        inventoryItemRepository.deleteByUserId(userId);
        recipeSearchLogRepository.deleteByUserId(userId);
        userNotificationRepository.deleteByUserId(userId);
        userRecipeReminderRepository.deleteByUserId(userId);
        mealPlanEntryRepository.deleteByUserId(userId);

        // Finally, delete the user
        userRepository.delete(user);

        return new MessageResponse("User deleted successfully", true);
    }

    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}