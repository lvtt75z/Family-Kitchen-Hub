package com.c2se04.familykitchenhub.Util;

import com.c2se04.familykitchenhub.enums.Season;

import java.time.LocalDate;
import java.time.Month;

/**
 * Utility class for season detection
 */
public class SeasonUtil {

    /**
     * Get current season based on today's date (Northern Hemisphere)
     */
    public static Season getCurrentSeason() {
        return getSeasonForDate(LocalDate.now());
    }

    /**
     * Get season for a specific date
     * Adjusted for Vietnam climate:
     * Spring: January-April
     * Summer: May-August
     * Fall: September-October
     * Winter: November-December
     */
    public static Season getSeasonForDate(LocalDate date) {
        Month month = date.getMonth();

        return switch (month) {
            case JANUARY, FEBRUARY, MARCH, APRIL -> Season.SPRING;
            case MAY, JUNE, JULY, AUGUST -> Season.SUMMER;
            case SEPTEMBER, OCTOBER -> Season.FALL;
            case NOVEMBER, DECEMBER -> Season.WINTER;
        };
    }

    /**
     * Get season name for display
     */
    public static String getSeasonDisplayName(Season season) {
        return switch (season) {
            case SPRING -> "Spring";
            case SUMMER -> "Summer";
            case FALL -> "Fall";
            case WINTER -> "Winter";
            case ALL -> "All Seasons";
        };
    }

    /**
     * Get season emoji for email templates
     */
    public static String getSeasonEmoji(Season season) {
        return switch (season) {
            case SPRING -> "🌸";
            case SUMMER -> "☀️";
            case FALL -> "🍂";
            case WINTER -> "❄️";
            case ALL -> "🍃";
        };
    }
}
