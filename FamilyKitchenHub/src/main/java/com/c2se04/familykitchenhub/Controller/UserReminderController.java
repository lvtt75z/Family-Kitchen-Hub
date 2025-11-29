package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.UpdateReminderDTO;
import com.c2se04.familykitchenhub.DTO.UserRecipeReminderDTO;
import com.c2se04.familykitchenhub.Service.UserRecipeReminderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User Recipe Reminder management
 */
@RestController
@RequestMapping("/api/users")
public class UserReminderController {

    private final UserRecipeReminderService reminderService;

    @Autowired
    public UserReminderController(UserRecipeReminderService reminderService) {
        this.reminderService = reminderService;
    }

    /**
     * POST /api/users/{userId}/reminders
     * Create a new reminder for the user
     */
    @PostMapping("/{userId}/reminders")
    public ResponseEntity<UserRecipeReminderDTO> createReminder(
            @PathVariable Long userId,
            @Valid @RequestBody UserRecipeReminderDTO reminderDTO) {
        UserRecipeReminderDTO created = reminderService.createReminder(userId, reminderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/users/{userId}/reminders
     * Get all reminders for the user
     * Optional filter: ?filter=upcoming or ?filter=past
     */
    @GetMapping("/{userId}/reminders")
    public ResponseEntity<List<UserRecipeReminderDTO>> getUserReminders(
            @PathVariable Long userId,
            @RequestParam(required = false) String filter) {

        List<UserRecipeReminderDTO> reminders;
        if ("upcoming".equalsIgnoreCase(filter)) {
            reminders = reminderService.getUpcomingReminders(userId);
        } else if ("past".equalsIgnoreCase(filter)) {
            reminders = reminderService.getPastReminders(userId);
        } else {
            reminders = reminderService.getUserReminders(userId);
        }

        return ResponseEntity.ok(reminders);
    }

    /**
     * GET /api/users/{userId}/reminders/unread
     * Get unread reminders for the user (for web notifications)
     */
    @GetMapping("/{userId}/reminders/unread")
    public ResponseEntity<List<UserRecipeReminderDTO>> getUnreadReminders(@PathVariable Long userId) {
        List<UserRecipeReminderDTO> unread = reminderService.getUnreadReminders(userId);
        return ResponseEntity.ok(unread);
    }

    /**
     * PUT /api/users/{userId}/reminders/{reminderId}
     * Update a reminder
     */
    @PutMapping("/{userId}/reminders/{reminderId}")
    public ResponseEntity<UserRecipeReminderDTO> updateReminder(
            @PathVariable Long userId,
            @PathVariable Long reminderId,
            @Valid @RequestBody UpdateReminderDTO reminderDTO) {
        UserRecipeReminderDTO updated = reminderService.updateReminder(userId, reminderId, reminderDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * PATCH /api/users/{userId}/reminders/{reminderId}/read
     * Mark a reminder as read
     */
    @PatchMapping("/{userId}/reminders/{reminderId}/read")
    public ResponseEntity<Void> markReminderAsRead(
            @PathVariable Long userId,
            @PathVariable Long reminderId) {
        reminderService.markAsRead(userId, reminderId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/users/{userId}/reminders/{reminderId}
     * Delete a reminder
     */
    @DeleteMapping("/{userId}/reminders/{reminderId}")
    public ResponseEntity<Void> deleteReminder(
            @PathVariable Long userId,
            @PathVariable Long reminderId) {
        reminderService.deleteReminder(userId, reminderId);
        return ResponseEntity.noContent().build();
    }
}
