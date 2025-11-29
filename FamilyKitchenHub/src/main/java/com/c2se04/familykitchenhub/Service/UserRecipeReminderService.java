package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.UpdateReminderDTO;
import com.c2se04.familykitchenhub.DTO.UserRecipeReminderDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.UserRecipeReminderRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.UserRecipeReminder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserRecipeReminderService {

    private final UserRecipeReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    @Autowired
    public UserRecipeReminderService(UserRecipeReminderRepository reminderRepository,
            UserRepository userRepository,
            RecipeRepository recipeRepository) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.recipeRepository = recipeRepository;
    }

    /**
     * Create a new reminder
     */
    @Transactional
    public UserRecipeReminderDTO createReminder(Long userId, UserRecipeReminderDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Recipe recipe = recipeRepository.findById(dto.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", dto.getRecipeId()));

        // Validate reminder time is in future
        if (dto.getReminderAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reminder time must be in the future");
        }

        UserRecipeReminder reminder = new UserRecipeReminder();
        reminder.setUser(user);
        reminder.setRecipe(recipe);
        reminder.setReminderAt(dto.getReminderAt());
        reminder.setNote(dto.getNote());

        UserRecipeReminder saved = reminderRepository.save(reminder);
        return toDTO(saved);
    }

    /**
     * Get all reminders for a user
     */
    public List<UserRecipeReminderDTO> getUserReminders(Long userId) {
        return reminderRepository.findByUserIdOrderByReminderAtAsc(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get upcoming reminders for a user
     */
    public List<UserRecipeReminderDTO> getUpcomingReminders(Long userId) {
        return reminderRepository.findByUserIdAndReminderAtAfter(userId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get past reminders for a user
     */
    public List<UserRecipeReminderDTO> getPastReminders(Long userId) {
        return reminderRepository.findByUserIdAndReminderAtBefore(userId, LocalDateTime.now())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get unread reminders for a user
     */
    public List<UserRecipeReminderDTO> getUnreadReminders(Long userId) {
        return reminderRepository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Update reminder
     */
    @Transactional
    public UserRecipeReminderDTO updateReminder(Long userId, Long reminderId, UpdateReminderDTO dto) {
        UserRecipeReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", reminderId));

        // Verify ownership
        if (!reminder.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own reminders");
        }

        // Validate reminder time is in future if being updated
        if (dto.getReminderAt() != null && dto.getReminderAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reminder time must be in the future");
        }

        if (dto.getReminderAt() != null) {
            reminder.setReminderAt(dto.getReminderAt());
        }
        if (dto.getNote() != null) {
            reminder.setNote(dto.getNote());
        }

        UserRecipeReminder updated = reminderRepository.save(reminder);
        return toDTO(updated);
    }

    /**
     * Mark reminder as read
     */
    @Transactional
    public void markAsRead(Long userId, Long reminderId) {
        UserRecipeReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", reminderId));

        // Verify ownership
        if (!reminder.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own reminders");
        }

        reminder.setIsRead(true);
        reminderRepository.save(reminder);
    }

    /**
     * Delete reminder
     */
    @Transactional
    public void deleteReminder(Long userId, Long reminderId) {
        UserRecipeReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", reminderId));

        // Verify ownership
        if (!reminder.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own reminders");
        }

        reminderRepository.delete(reminder);
    }

    /**
     * Get pending reminders (for scheduler)
     */
    public List<UserRecipeReminder> getPendingReminders() {
        return reminderRepository.findByReminderAtBeforeAndIsSentFalse(LocalDateTime.now());
    }

    /**
     * Mark reminder as sent (for scheduler)
     */
    @Transactional
    public void markAsSent(Long reminderId) {
        UserRecipeReminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder", "id", reminderId));
        reminder.setIsSent(true);
        reminderRepository.save(reminder);
    }

    /**
     * Convert entity to DTO
     */
    private UserRecipeReminderDTO toDTO(UserRecipeReminder reminder) {
        return new UserRecipeReminderDTO(
                reminder.getId(),
                reminder.getRecipe().getId(),
                reminder.getRecipe().getTitle(),
                reminder.getReminderAt(),
                reminder.getNote(),
                reminder.getIsSent(),
                reminder.getIsRead(),
                reminder.getCreatedAt());
    }
}
