package com.c2se04.familykitchenhub.Util;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    // Email pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    // Password pattern: 6-31 chars, must include uppercase, lowercase, number, and special char
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{6,31}$"
    );
    
    // Username pattern: 3-20 chars, alphanumeric, underscore, and hyphen only, must start with letter or number
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
            "^[A-Za-z0-9][A-Za-z0-9_-]{2,19}$"
    );
    
    /**
     * Validate if string is a valid email
     * @param email Email to validate
     * @return true if valid email
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }
    
    /**
     * Validate if string is a valid username
     * Requirements: 6-20 characters, alphanumeric with underscore and hyphen allowed, must start with letter or number
     * @param username Username to validate
     * @return true if valid username
     */
    public static boolean isValidUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return USERNAME_PATTERN.matcher(username.trim()).matches();
    }
    
    /**
     * Get detailed username validation error message
     * @param username Username to validate
     * @return Error message or null if valid
     */
    public static String getUsernameValidationError(String username) {
        if (username == null || username.trim().isEmpty()) {
            return "Username is required";
        }
        
        String trimmedUsername = username.trim();
        
        if (trimmedUsername.length() < 6) {
            return "Username must be at least 6 characters long";
        }
        
        if (trimmedUsername.length() > 20) {
            return "Username must not exceed 20 characters";
        }
        
        if (!trimmedUsername.matches("^[A-Za-z0-9].*")) {
            return "Username must start with a letter or number";
        }
        
        if (!trimmedUsername.matches("^[A-Za-z0-9_-]+$")) {
            return "Username can only contain letters, numbers, underscores, and hyphens";
        }
        
        return null; // Username is valid
    }
    

    /**
     * Validate password complexity
     * Requirements: 6-31 characters, must include uppercase, lowercase, number, and special character
     * @param password Password to validate
     * @return true if password meets complexity requirements
     */
    public static boolean isValidPassword(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
    
    /**
     * Get detailed password validation error message
     * @param password Password to validate
     * @return Error message or null if valid
     */
    public static String getPasswordValidationError(String password) {
        if (password == null || password.isEmpty()) {
            return "Password is required";
        }
        
        if (password.length() < 6) {
            return "Password must be at least 6 characters long";
        }
        
        if (password.length() > 31) {
            return "Password must not exceed 31 characters";
        }
        
        if (!password.matches(".*[a-z].*")) {
            return "Password must contain at least one lowercase letter";
        }
        
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter";
        }
        
        if (!password.matches(".*\\d.*")) {
            return "Password must contain at least one number";
        }
        
        if (!password.matches(".*[@$!%*?&].*")) {
            return "Password must contain at least one special character (@$!%*?&)";
        }
        
        return null; // Password is valid
    }
}


