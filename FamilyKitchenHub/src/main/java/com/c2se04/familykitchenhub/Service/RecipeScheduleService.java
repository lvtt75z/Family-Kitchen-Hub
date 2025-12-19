package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.RecipeScheduleDTO;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.RecipeScheduleRepository;
import com.c2se04.familykitchenhub.enums.Season;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeScheduleService {

    private final RecipeScheduleRepository scheduleRepository;
    private final RecipeRepository recipeRepository;

    @Autowired
    public RecipeScheduleService(RecipeScheduleRepository scheduleRepository, RecipeRepository recipeRepository) {
        this.scheduleRepository = scheduleRepository;
        this.recipeRepository = recipeRepository;
    }

    /**
     * Create or update schedule for a recipe
     */
    @Transactional
    public RecipeScheduleDTO setRecipeSchedule(Long recipeId, RecipeScheduleDTO dto) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        RecipeSchedule schedule = scheduleRepository.findByRecipeId(recipeId)
                .orElse(new RecipeSchedule());

        schedule.setRecipe(recipe);
        schedule.setSeason(dto.getSeason());
        schedule.setWeather(dto.getWeather());
        schedule.setOccasion(dto.getOccasion());
        schedule.setNotes(dto.getNotes());

        RecipeSchedule saved = scheduleRepository.save(schedule);
        return toDTO(saved);
    }

    /**
     * Get schedule for a recipe
     */
    public Optional<RecipeScheduleDTO> getScheduleByRecipeId(Long recipeId) {
        return scheduleRepository.findByRecipeId(recipeId)
                .map(this::toDTO);
    }

    /**
     * Delete schedule for a recipe
     */
    @Transactional
    public void deleteScheduleByRecipeId(Long recipeId) {
        scheduleRepository.deleteByRecipeId(recipeId);
    }

    /**
     * Find schedules by season
     */
    public List<RecipeScheduleDTO> findBySeason(Season season) {
        return scheduleRepository.findBySeason(season)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Find schedules by occasion keyword
     */
    public List<RecipeScheduleDTO> findByOccasion(String occasion) {
        return scheduleRepository.findByOccasionContainingIgnoreCase(occasion)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Convert entity to DTO
     */
    private RecipeScheduleDTO toDTO(RecipeSchedule schedule) {
        return new RecipeScheduleDTO(
                schedule.getId(),
                schedule.getRecipe().getId(),
                schedule.getSeason(),
                schedule.getWeather(),
                schedule.getOccasion(),
                schedule.getNotes());
    }
}
