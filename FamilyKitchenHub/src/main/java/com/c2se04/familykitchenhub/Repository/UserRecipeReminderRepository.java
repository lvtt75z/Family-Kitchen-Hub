package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.UserRecipeReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserRecipeReminderRepository extends JpaRepository<UserRecipeReminder, Long> {

    List<UserRecipeReminder> findByUserIdOrderByReminderAtAsc(Long userId);

    List<UserRecipeReminder> findByUserIdAndIsSentFalseOrderByReminderAtAsc(Long userId);

    List<UserRecipeReminder> findByUserIdAndIsReadFalse(Long userId);

    // Use JOIN FETCH to eagerly load User, Recipe, AND Recipe Ingredients to avoid
    // LazyInitializationException
    @Query("SELECT DISTINCT r FROM UserRecipeReminder r " +
            "JOIN FETCH r.user " +
            "JOIN FETCH r.recipe recipe " +
            "LEFT JOIN FETCH recipe.recipeIngredients ri " +
            "LEFT JOIN FETCH ri.ingredient " +
            "WHERE r.reminderAt <= :now AND r.isSent = false")
    List<UserRecipeReminder> findByReminderAtBeforeAndIsSentFalse(@Param("now") LocalDateTime now);

    List<UserRecipeReminder> findByUserIdAndReminderAtAfter(Long userId, LocalDateTime now);

    List<UserRecipeReminder> findByUserIdAndReminderAtBefore(Long userId, LocalDateTime now);

    void deleteByUserId(Long userId);

    // Cascade deletion method for recipe deletion
    void deleteByRecipeId(Long recipeId);
}
