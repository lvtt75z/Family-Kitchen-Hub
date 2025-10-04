package com.c2se04.familykitchenhub.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    /**
     * Send OTP verification email
     * @param toEmail Recipient email
     * @param otpCode OTP code
     */
    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Email Verification - Family Kitchen Hub");
            
            String htmlContent = buildOtpEmailTemplate(otpCode);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
    
    /**
     * Send password reset email
     * @param toEmail Recipient email
     * @param resetToken Reset token
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset - Family Kitchen Hub");
            
            String htmlContent = buildPasswordResetEmailTemplate(resetToken);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
    
    private String buildOtpEmailTemplate(String otpCode) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #4CAF50; text-align: center; padding: 20px; background-color: #e8f5e9; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Email Verification</h1>
                        </div>
                        <div class="content">
                            <h2>Welcome to Family Kitchen Hub!</h2>
                            <p>Thank you for registering. Please use the following OTP code to verify your email address:</p>
                            <div class="otp-code">%s</div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request this verification, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(otpCode);
    }
    
    private String buildPasswordResetEmailTemplate(String resetToken) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; }
                        .reset-token { font-size: 16px; font-weight: bold; color: #2196F3; padding: 15px; background-color: #e3f2fd; border-radius: 5px; margin: 20px 0; word-break: break-all; }
                        .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <h2>Reset Your Password</h2>
                            <p>We received a request to reset your password. Use the following reset token:</p>
                            <div class="reset-token">%s</div>
                            <p>This token will expire in 1 hour.</p>
                            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(resetToken);
    }
}


