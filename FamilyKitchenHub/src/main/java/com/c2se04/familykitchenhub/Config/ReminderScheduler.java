package com.c2se04.familykitchenhub.Config;

import com.c2se04.familykitchenhub.Repository.UserRecipeReminderRepository;
import com.c2se04.familykitchenhub.Service.NotificationService;
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
 */
@Component
public class ReminderScheduler {

    private final UserRecipeReminderRepository reminderRepository;
    private final NotificationService notificationService;

    @Autowired
    public ReminderScheduler(UserRecipeReminderRepository reminderRepository,
            NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
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
        List<UserRecipeReminder> reminders = reminderRepository.findByReminderAtBeforeAndIsSentFalse(now);

        if (reminders.isEmpty()) {
            return;
        }

        System.out.println("ReminderScheduler: Found " + reminders.size() + " pending reminders");

        int successCount = 0;
        int batchSize = 50; // Process 50 reminders at a time to reduce memory usage

        for (int i = 0; i < reminders.size(); i += batchSize) {
            int end = Math.min(i + batchSize, reminders.size());
            List<UserRecipeReminder> batch = reminders.subList(i, end);

            for (UserRecipeReminder reminder : batch) {
                try {
                    notificationService.sendReminderNotification(reminder);
                    successCount++;
                } catch (Exception e) {
                    System.err.println("Failed to send reminder ID: " + reminder.getId());
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
