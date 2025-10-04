package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.*;
import com.c2se04.familykitchenhub.DTO.Response.AuthResponse;
import com.c2se04.familykitchenhub.DTO.Response.MessageResponse;
import com.c2se04.familykitchenhub.DTO.Response.UserResponse;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Enum.Role;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Jwt.JwtTokenProvider;
import com.c2se04.familykitchenhub.Mapper.UserMapper;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.Util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private UserMapper userMapper;
    
    /**
     * Register a new user
     * @param request Registration request
     * @return Success message
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        // Validate username format
        String usernameError = com.c2se04.familykitchenhub.Util.ValidationUtil.getUsernameValidationError(request.getUsername());
        if (usernameError != null) {
            throw new BadRequestException(usernameError);
        }
        
        // Validate password complexity
        String passwordError = com.c2se04.familykitchenhub.Util.ValidationUtil.getPasswordValidationError(request.getPassword());
        if (passwordError != null) {
            throw new BadRequestException(passwordError);
        }
        
        // Validate password and repeat password match
        if (!request.getPassword().equals(request.getRepeatPassword())) {
            throw new BadRequestException("Password and repeat password do not match");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        
        // Generate OTP code
        String otpCode = generateOtpCode();
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(PasswordUtil.hashPassword(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(Role.USER);
        user.setIsVerified(false);
        user.setVerificationCode(otpCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        
        userRepository.save(user);
        
        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), otpCode);
        
        return new MessageResponse("Registration successful! Please check your email for verification code.", true);
    }
    
    /**
     * Verify email with OTP
     * @param request OTP verification request
     * @return Success message
     */
    @Transactional
    public MessageResponse verifyEmail(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getIsVerified()) {
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
     * Resend OTP code
     * @param request Resend OTP request
     * @return Success message
     */
    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getIsVerified()) {
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
     * Login user
     * @param request Login request
     * @return Authentication response with JWT token
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(), 
                request.getUsernameOrEmail()
        ).orElseThrow(() -> new BadRequestException("Invalid username/email or password"));
        
        if (!PasswordUtil.verifyPassword(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid username/email or password");
        }
        
        if (!user.getIsVerified()) {
            throw new BadRequestException("Please verify your email before logging in");
        }
        
        String token = jwtTokenProvider.generateToken(user.getUsername());
        UserResponse userResponse = userMapper.toUserResponse(user);
        
        return new AuthResponse(token, userResponse);
    }
    
    /**
     * Forgot password - send reset token
     * @param request Forgot password request
     * @return Success message
     */
    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with this email"));
        
        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        
        return new MessageResponse("Password reset instructions have been sent to your email", true);
    }
    
    /**
     * Reset password with token
     * @param request Reset password request
     * @return Success message
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getResetToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));
        
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }
        
        // Validate password complexity
        String passwordError = com.c2se04.familykitchenhub.Util.ValidationUtil.getPasswordValidationError(request.getNewPassword());
        if (passwordError != null) {
            throw new BadRequestException(passwordError);
        }
        
        // Validate password and repeat password match
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
     * Generate 6-digit OTP code
     * @return OTP code
     */
    private String generateOtpCode() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}

