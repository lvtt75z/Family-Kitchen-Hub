package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.enums.Season;
import com.c2se04.familykitchenhub.model.RecipeSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeScheduleRepository extends JpaRepository<RecipeSchedule, Long> {

    Optional<RecipeSchedule> findByRecipeId(Long recipeId);

    // Find schedules by season with eagerly loaded recipe and ingredients
    @Query("SELECT DISTINCT rs FROM RecipeSchedule rs " +
            "JOIN FETCH rs.recipe r " +
            "LEFT JOIN FETCH r.recipeIngredients ri " +
            "LEFT JOIN FETCH ri.ingredient " +
            "WHERE rs.season = :season OR rs.season = 'ALL'")
    List<RecipeSchedule> findBySeason(@Param("season") Season season);

    List<RecipeSchedule> findByOccasionContainingIgnoreCase(String occasion);

    List<RecipeSchedule> findByWeatherContainingIgnoreCase(String weather);

    void deleteByRecipeId(Long recipeId);
}
