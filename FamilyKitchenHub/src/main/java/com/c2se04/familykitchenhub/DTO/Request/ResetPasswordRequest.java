package com.c2se04.familykitchenhub.DTO.Request;

import jakarta.validation.constraints.NotBlank;

public class ResetPasswordRequest {
    
    @NotBlank(message = "Reset token is required")
    private String resetToken;
    
    @NotBlank(message = "New password is required")
    private String newPassword;
    
    @NotBlank(message = "Repeat password is required")
    private String repeatPassword;

    // Constructors
    public ResetPasswordRequest() {
    }

    public ResetPasswordRequest(String resetToken, String newPassword, String repeatPassword) {
        this.resetToken = resetToken;
        this.newPassword = newPassword;
        this.repeatPassword = repeatPassword;
    }

    // Getters and Setters
    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getRepeatPassword() {
        return repeatPassword;
    }

    public void setRepeatPassword(String repeatPassword) {
        this.repeatPassword = repeatPassword;
    }
}

