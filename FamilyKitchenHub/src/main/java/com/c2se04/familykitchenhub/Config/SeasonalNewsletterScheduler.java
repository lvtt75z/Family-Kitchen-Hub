package com.c2se04.familykitchenhub.Config;

import com.c2se04.familykitchenhub.DTO.IngredientAvailability;
import com.c2se04.familykitchenhub.DTO.RecipeWithAvailability;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Repository.RecipeScheduleRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.Service.EmailService;
import com.c2se04.familykitchenhub.Service.RecipeInventoryCheckerService;
import com.c2se04.familykitchenhub.Util.SeasonUtil;
import com.c2se04.familykitchenhub.enums.Season;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduler for sending monthly seasonal recipe newsletters
 */
@Component
public class SeasonalNewsletterScheduler {

    private final UserRepository userRepository;
    private final RecipeScheduleRepository scheduleRepository;
    private final RecipeInventoryCheckerService inventoryChecker;
    private final EmailService emailService;

    @Autowired
    public SeasonalNewsletterScheduler(UserRepository userRepository,
            RecipeScheduleRepository scheduleRepository,
            RecipeInventoryCheckerService inventoryChecker,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.scheduleRepository = scheduleRepository;
        this.inventoryChecker = inventoryChecker;
        this.emailService = emailService;
    }

    /**
     * Send monthly seasonal newsletters to all users
     * Runs: 9 AM on the 1st day of each month
     */
    /* Test send per 2 mins: 0 *//*2 * * * ? */
    @Scheduled(cron = "0 0 9 1 * ?")
    public void sendMonthlySeasonalNewsletters() {
        System.out.println("Seasonal Newsletter Scheduler: Starting monthly send...");

        Season currentSeason = SeasonUtil.getCurrentSeason();
        List<User> allUsers = userRepository.findAll();

        System.out.println("Seasonal Newsletter: Current season is " + currentSeason);
        System.out.println("Seasonal Newsletter: Sending to " + allUsers.size() + " users");

        int successCount = 0;
        for (User user : allUsers) {
            try {
                sendNewsletterToUser(user, currentSeason);
                successCount++;
            } catch (Exception e) {
                System.err.println("Failed to send newsletter to user ID: " + user.getId());
                e.printStackTrace();
            }
        }

        System.out.println(
                "Seasonal Newsletter: Successfully sent to " + successCount + " / " + allUsers.size() + " users");
    }

    /**
     * Send newsletter to a single user
     */
    private void sendNewsletterToUser(User user, Season season) {
        // 1. Get seasonal recipes (limit to 5 for email brevity)
        List<RecipeSchedule> schedules = scheduleRepository.findBySeason(season);
        List<Recipe> seasonalRecipes = schedules.stream()
                .map(RecipeSchedule::getRecipe)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        if (seasonalRecipes.isEmpty()) {
            System.out.println("No seasonal recipes found for " + season + ", skipping user " + user.getId());
            return;
        }

        // 2. Check inventory for each recipe
        List<RecipeWithAvailability> recipesWithStatus = new ArrayList<>();
        for (Recipe recipe : seasonalRecipes) {
            IngredientAvailability availability = inventoryChecker.checkRecipeAvailability(user.getId(), recipe);
            recipesWithStatus.add(new RecipeWithAvailability(recipe, availability));
        }

        // 3. Send email
        emailService.sendSeasonalNewsletter(user.getEmail(), season, recipesWithStatus);
    }
}
