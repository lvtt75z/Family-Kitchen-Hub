package com.c2se04.familykitchenhub.Config;

import com.c2se04.familykitchenhub.Repository.UserRecipeReminderRepository;
import com.c2se04.familykitchenhub.Service.NotificationService;
import com.c2se04.familykitchenhub.Service.InventoryItemService;
import com.c2se04.familykitchenhub.model.UserRecipeReminder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task to check and send pending recipe reminders
 * Runs every 5 minutes, optimized for low-memory servers (< 3GB RAM)
 * Auto-cooks recipes when reminder time passes (deducts ingredients)
 */
@Component
public class ReminderScheduler {

    private final UserRecipeReminderRepository reminderRepository;
    private final NotificationService notificationService;
    private final InventoryItemService inventoryItemService;

    @Autowired
    public ReminderScheduler(UserRecipeReminderRepository reminderRepository,
            NotificationService notificationService,
            InventoryItemService inventoryItemService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
        this.inventoryItemService = inventoryItemService;
    }

    /**
     * Check for reminders every 5 minutes
     * Optimized with batch processing and @Transactional for memory efficiency
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void checkReminders() {
        LocalDateTime now = LocalDateTime.now();

        // Fetch all pending reminders
        // Only process reminders where:
        // 1. Reminder time has passed
        // 2. Not yet sent
        // 3. Created at least 1 minute ago (to prevent immediate processing after
        // creation)
        List<UserRecipeReminder> allReminders = reminderRepository.findByReminderAtBeforeAndIsSentFalse(now);

        // Filter out reminders created less than 1 minute ago
        LocalDateTime oneMinuteAgo = now.minusMinutes(1);
        List<UserRecipeReminder> reminders = allReminders.stream()
                .filter(r -> r.getCreatedAt().isBefore(oneMinuteAgo))
                .toList();

        if (reminders.isEmpty()) {
            return;
        }

        System.out.println("ReminderScheduler: Found " + reminders.size() + " pending reminders (filtered from "
                + allReminders.size() + " total)");

        int successCount = 0;
        int batchSize = 50; // Process 50 reminders at a time to reduce memory usage

        for (int i = 0; i < reminders.size(); i += batchSize) {
            int end = Math.min(i + batchSize, reminders.size());
            List<UserRecipeReminder> batch = reminders.subList(i, end);

            for (UserRecipeReminder reminder : batch) {
                try {
                    // Auto-cook recipe: deduct ingredients from user's fridge
                    try {
                        Long userId = reminder.getUser().getId();
                        Long recipeId = reminder.getRecipe().getId();

                        System.out.println("Auto-cooking recipe ID: " + recipeId + " for user ID: " + userId);

                        inventoryItemService.deductIngredientsForRecipeWithDetails(userId, recipeId);

                        System.out.println("Successfully auto-cooked recipe ID: " + recipeId);
                    } catch (Exception cookError) {
                        System.err.println("Failed to auto-cook recipe for reminder ID: " + reminder.getId());
                        System.err.println("Reason: " + cookError.getMessage());
                        // Continue to send notification even if cooking fails
                    }

                    // Send reminder notification
                    notificationService.sendReminderNotification(reminder);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("Failed to process reminder ID: " + reminder.getId());
                    e.printStackTrace();
                }
            }

            // Clear batch from memory after processing
            batch.clear();

            // Suggest garbage collection between batches (hint only)
            if (i + batchSize < reminders.size()) {
                System.gc();
            }
        }

        System.out.println("ReminderScheduler: Sent " + successCount + " / " + reminders.size() + " reminders");
    }
}
