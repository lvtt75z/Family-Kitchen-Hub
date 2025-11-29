package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.IngredientAvailability;
import com.c2se04.familykitchenhub.DTO.IngredientStatus;
import com.c2se04.familykitchenhub.DTO.RecipeWithAvailability;
import com.c2se04.familykitchenhub.Util.SeasonUtil;
import com.c2se04.familykitchenhub.enums.Season;
import com.c2se04.familykitchenhub.model.Recipe;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Email Verification - Family Kitchen Hub");
            helper.setText(buildOtpEmailTemplate(otpCode), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset - Family Kitchen Hub");
            helper.setText(buildPasswordResetEmailTemplate(resetToken), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    public void sendRecipeReminderEmailWithInventory(String toEmail, String recipeName, String recipeInstructions,
            String note, String reminderTime, IngredientAvailability availability) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Recipe Reminder - " + recipeName);
            helper.setText(
                    buildRecipeReminderEmailTemplate(recipeName, recipeInstructions, note, reminderTime, availability),
                    true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send recipe reminder email", e);
        }
    }

    public void sendSeasonalNewsletter(String toEmail, Season season, List<RecipeWithAvailability> recipes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(SeasonUtil.getSeasonEmoji(season) + " " +
                    SeasonUtil.getSeasonDisplayName(season) + " Recipe Suggestions");
            helper.setText(buildSeasonalNewsletterTemplate(season, recipes), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send seasonal newsletter", e);
        }
    }

    private String buildOtpEmailTemplate(String otpCode) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html><head><style>
                            body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
                            .container{max-width:600px;margin:0 auto;padding:20px}
                            .header{background-color:#4CAF50;color:white;padding:20px;text-align:center}
                            .content{background-color:#f9f9f9;padding:30px;border-radius:5px}
                            .otp-code{font-size:32px;font-weight:bold;color:#4CAF50;text-align:center;padding:20px;background-color:#e8f5e9;border-radius:5px;margin:20px 0}
                            .footer{text-align:center;margin-top:20px;color:#777;font-size:12px}
                        </style></head><body>
                            <div class="container">
                                <div class="header"><h1>Email Verification</h1></div>
                                <div class="content">
                                    <h2>Welcome to Family Kitchen Hub!</h2>
                                    <p>Thank you for registering. Please use the following OTP code to verify your email address:</p>
                                    <div class="otp-code">%s</div>
                                    <p>This code will expire in 10 minutes.</p>
                                </div>
                                <div class="footer"><p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p></div>
                            </div>
                        </body></html>
                        """,
                otpCode);
    }

    private String buildPasswordResetEmailTemplate(String resetToken) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html><head><style>
                            body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
                            .container{max-width:600px;margin:0 auto;padding:20px}
                            .header{background-color:#2196F3;color:white;padding:20px;text-align:center}
                            .content{background-color:#f9f9f9;padding:30px;border-radius:5px}
                            .reset-token{font-size:16px;font-weight:bold;color:#2196F3;padding:15px;background-color:#e3f2fd;border-radius:5px;margin:20px 0;word-break:break-all}
                            .footer{text-align:center;margin-top:20px;color:#777;font-size:12px}
                        </style></head><body>
                            <div class="container">
                                <div class="header"><h1>Password Reset Request</h1></div>
                                <div class="content">
                                    <h2>Reset Your Password</h2>
                                    <p>We received a request to reset your password. Use the following reset token:</p>
                                    <div class="reset-token">%s</div>
                                    <p>This token will expire in 1 hour.</p>
                                </div>
                                <div class="footer"><p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p></div>
                            </div>
                        </body></html>
                        """,
                resetToken);
    }

    private String buildRecipeReminderEmailTemplate(String recipeName, String recipeInstructions, String note,
            String reminderTime, IngredientAvailability availability) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append(
                "body{font-family:Arial,sans-serif;line-height:1.6;color:#333;background-color:#F0F4F0;margin:0;padding:20px}");
        html.append(
                ".container{max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}");
        html.append(
                ".header{background:linear-gradient(135deg,#81C784,#A5D6A7);color:white;padding:30px;text-align:center}");
        html.append(".header h1{margin:0;font-size:28px}");
        html.append(".content{padding:30px;background-color:#fff}");
        html.append(
                ".recipe-name{font-size:24px;font-weight:bold;color:#2E7D32;text-align:center;padding:20px;background:linear-gradient(to right,#F1F8E9,#FFFFFF);border-radius:8px;margin:20px 0;border-left:5px solid #66BB6A}");
        html.append(
                ".time-info{font-size:14px;color:#666;text-align:center;margin:15px 0;background:#E8F5E9;padding:10px;border-radius:6px}");
        html.append(
                ".recipe-box{margin:20px 0;padding:20px;background:#F9FFF9;border-radius:8px;border:2px dashed #81C784}");
        html.append(".recipe-box h3{margin:0 0 15px 0;color:#2E7D32;font-size:18px}");
        html.append(".recipe-text{color:#555;line-height:1.8;white-space:pre-wrap}");
        html.append(".ingredient-section{margin:20px 0;padding:15px;border-radius:8px}");
        html.append(".available-section{background:#E8F5E9;border-left:4px solid #66BB6A}");
        html.append(".missing-section{background:#FFF3E0;border-left:4px solid #FF9800}");
        html.append(".section-title{font-weight:600;margin:0 0 10px 0;font-size:16px;color:#2E7D32}");
        html.append(".missing-section .section-title{color:#F57C00}");
        html.append("ul{margin:0;padding-left:20px}li{margin:5px 0}");
        html.append(
                ".footer{text-align:center;padding:20px;background-color:#F9FBF9;color:#777;font-size:12px;border-top:1px solid #E0E0E0}");
        html.append("</style></head><body><div class=\"container\">");
        html.append("<div class=\"header\"><h1>🍳 Time to Cook!</h1></div>");
        html.append("<div class=\"content\"><h2 style=\"color:#2E7D32;text-align:center\">Recipe Reminder</h2>");
        html.append("<div class=\"recipe-name\">").append(recipeName).append("</div>");
        html.append("<p class=\"time-info\">⏰ Scheduled for: ").append(reminderTime).append("</p>");

        if (note != null && !note.isEmpty()) {
            html.append("<p><strong>Your Note:</strong> ").append(note).append("</p>");
        }

        if (recipeInstructions != null && !recipeInstructions.isEmpty()) {
            html.append("<div class=\"recipe-box\"><h3>📖 Recipe Instructions:</h3>");
            html.append("<div class=\"recipe-text\">").append(recipeInstructions.replace("\n", "<br>"))
                    .append("</div></div>");
        }

        if (!availability.getAvailable().isEmpty()) {
            html.append(
                    "<div class=\"ingredient-section available-section\"><p class=\"section-title\">✓ You have:</p><ul>");
            for (IngredientStatus ing : availability.getAvailable()) {
                html.append(String.format("<li>%s: %.0f%s</li>",
                        ing.getName(), ing.getQuantityAvailable(), ing.getUnit() != null ? ing.getUnit() : "g"));
            }
            html.append("</ul></div>");
        }

        if (!availability.getMissing().isEmpty()) {
            html.append(
                    "<div class=\"ingredient-section missing-section\"><p class=\"section-title\">⚠ You're missing:</p><ul>");
            for (IngredientStatus ing : availability.getMissing()) {
                html.append(String.format("<li>%s: need %.0f%s more</li>",
                        ing.getName(), ing.getQuantityLacking(), ing.getUnit() != null ? ing.getUnit() : "g"));
            }
            html.append("</ul></div>");
        }

        html.append("</div><div class=\"footer\"><p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p></div>");
        html.append("</div></body></html>");
        return html.toString();
    }

    private String buildSeasonalNewsletterTemplate(Season season, List<RecipeWithAvailability> recipes) {
        StringBuilder recipeCards = new StringBuilder();
        for (RecipeWithAvailability recipeData : recipes) {
            recipeCards.append(buildRecipeCard(recipeData));
        }

        return String.format(
                """
                        <!DOCTYPE html>
                        <html><head><style>
                            body{font-family:'Segoe UI',Arial,sans-serif;line-height:1.6;color:#2E4053;margin:0;padding:0;background-color:#F0F4F0}
                            .container{max-width:700px;margin:20px auto;background-color:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)}
                            .header{background:linear-gradient(135deg,#4CAF50,#66BB6A);color:white;padding:40px 30px;text-align:center}
                            .header h1{margin:0 0 10px 0;font-size:32px;font-weight:600}
                            .content{padding:30px;background-color:white}
                            .recipe-card{background:linear-gradient(to right,#F1F8E9,#FFFFFF);margin:25px 0;padding:25px;border-radius:10px;border-left:5px solid #4CAF50;box-shadow:0 2px 4px rgba(0,0,0,0.05)}
                            .recipe-card h2{margin:0 0 15px 0;color:#2E7D32;font-size:22px}
                            .ingredient-section{margin:12px 0;padding:12px;background:white;border-radius:6px}
                            .available{color:#2E7D32;font-weight:500}
                            .available::before{content:'✓ ';color:#4CAF50;font-weight:bold}
                            .missing{color:#F57C00;font-weight:500}
                            .missing::before{content:'⚠ ';font-weight:bold}
                            .ingredient-list{margin:8px 0;font-size:14px;line-height:1.8}
                            .btn-green{display:inline-block;padding:12px 28px;background:#4CAF50;color:white;text-decoration:none;border-radius:6px;font-weight:500;margin-top:15px}
                            .footer{text-align:center;padding:25px;background-color:#F9FBF9;color:#666;font-size:13px;border-top:1px solid #E0E0E0}
                            .badge{display:inline-block;padding:4px 10px;background:#C8E6C9;color:#2E7D32;border-radius:12px;font-size:12px;font-weight:600;margin-left:10px}
                        </style></head><body>
                            <div class="container">
                                <div class="header">
                                    <h1>%s %s Recipe Suggestions</h1>
                                    <p>Delicious seasonal recipes curated just for you!</p>
                                </div>
                                <div class="content">
                                    <p style="font-size:16px;color:#555;margin-bottom:25px">
                                        Hi! We've handpicked some wonderful %s recipes for you:
                                    </p>
                                    %s
                                </div>
                                <div class="footer">
                                    <p>&copy; 2025 Family Kitchen Hub. All rights reserved.</p>
                                    <p style="margin-top:8px">This is your monthly seasonal recipe newsletter</p>
                                </div>
                            </div>
                        </body></html>
                        """,
                SeasonUtil.getSeasonEmoji(season), SeasonUtil.getSeasonDisplayName(season),
                SeasonUtil.getSeasonDisplayName(season).toLowerCase(), recipeCards);
    }

    private String buildRecipeCard(RecipeWithAvailability recipeData) {
        Recipe recipe = recipeData.getRecipe();
        IngredientAvailability availability = recipeData.getAvailability();

        StringBuilder availableList = new StringBuilder();
        if (!availability.getAvailable().isEmpty()) {
            availableList.append(
                    "<div class='ingredient-section'><p class='available'>You have these ingredients:</p><div class='ingredient-list'>");
            for (IngredientStatus ing : availability.getAvailable()) {
                availableList.append(String.format("%s (%.0f%s), ",
                        ing.getName(), ing.getQuantityAvailable(), ing.getUnit() != null ? ing.getUnit() : "g"));
            }
            if (availableList.length() > 0)
                availableList.setLength(availableList.length() - 2);
            availableList.append("</div></div>");
        }

        StringBuilder missingList = new StringBuilder();
        if (!availability.getMissing().isEmpty()) {
            missingList.append(
                    "<div class='ingredient-section'><p class='missing'>You're missing:</p><div class='ingredient-list'>");
            for (IngredientStatus ing : availability.getMissing()) {
                missingList.append(String.format("%s (need %.0f%s more), ",
                        ing.getName(), ing.getQuantityLacking(), ing.getUnit() != null ? ing.getUnit() : "g"));
            }
            if (missingList.length() > 0)
                missingList.setLength(missingList.length() - 2);
            missingList.append("</div></div>");
        }

        String badge = availability.hasAllIngredients()
                ? "<span class='badge'>✓ Can Cook Now!</span>"
                : String.format("<span class='badge' style='background:#FFE0B2;color:#E65100'>%d/%d ingredients</span>",
                        availability.getAvailableCount(), availability.getTotalIngredients());

        return String.format("""
                <div class="recipe-card">
                    <h2>%s%s</h2>
                    %s
                    %s
                    <div style="margin-top:15px"><a href="#" class="btn-green">View Full Recipe</a></div>
                </div>
                """, recipe.getTitle(), badge, availableList, missingList);
    }
}
