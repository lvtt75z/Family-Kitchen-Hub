package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.IngredientAvailability;
import com.c2se04.familykitchenhub.model.UserRecipeReminder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Notification service to handle sending reminders via email and web
 * notifications
 */
@Service
public class NotificationService {

    private final EmailService emailService;
    private final UserRecipeReminderService reminderService;
    private final RecipeInventoryCheckerService inventoryChecker;

    @Autowired
    public NotificationService(EmailService emailService,
            UserRecipeReminderService reminderService,
            RecipeInventoryCheckerService inventoryChecker) {
        this.emailService = emailService;
        this.reminderService = reminderService;
        this.inventoryChecker = inventoryChecker;
    }

    /**
     * Send reminder notification (email + web)
     * Web notification is handled by marking is_sent flag
     * Frontend polls /unread endpoint to get notifications
     */
    public void sendReminderNotification(UserRecipeReminder reminder) {
        try {
            // Format reminder time
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            String formattedTime = reminder.getReminderAt().format(formatter);

            // Check inventory for this recipe
            IngredientAvailability availability = inventoryChecker.checkRecipeAvailability(
                    reminder.getUser().getId(),
                    reminder.getRecipe());

            // Send email notification with inventory info
            emailService.sendRecipeReminderEmailWithInventory(
                    reminder.getUser().getEmail(),
                    reminder.getRecipe().getTitle(),
                    reminder.getRecipe().getInstructions(),
                    reminder.getNote(),
                    formattedTime,
                    availability);

            // Mark as sent (this serves as the web notification flag)
            reminderService.markAsSent(reminder.getId());

        } catch (Exception e) {
            // Log error but don't throw - we don't want to stop the scheduler
            System.err.println("Failed to send reminder notification for reminder ID: " + reminder.getId());
            e.printStackTrace();
        }
    }
}
