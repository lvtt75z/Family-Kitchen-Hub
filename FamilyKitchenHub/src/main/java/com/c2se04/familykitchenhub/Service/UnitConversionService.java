package com.c2se04.familykitchenhub.Service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UnitConversionService {

    // Unit conversion ratios (to base units)
    private static final Map<String, Double> WEIGHT_CONVERSIONS = new HashMap<>();
    private static final Map<String, Double> VOLUME_CONVERSIONS = new HashMap<>();
    private static final Map<String, Double> COUNT_CONVERSIONS = new HashMap<>();

    static {
        // Weight (to grams)
        WEIGHT_CONVERSIONS.put("kg", 1000.0);
        WEIGHT_CONVERSIONS.put("g", 1.0);
        WEIGHT_CONVERSIONS.put("mg", 0.001);
        WEIGHT_CONVERSIONS.put("lb", 453.592);
        WEIGHT_CONVERSIONS.put("oz", 28.3495);

        // Volume (to ml)
        VOLUME_CONVERSIONS.put("l", 1000.0);
        VOLUME_CONVERSIONS.put("liter", 1000.0);
        VOLUME_CONVERSIONS.put("litre", 1000.0);
        VOLUME_CONVERSIONS.put("ml", 1.0);
        VOLUME_CONVERSIONS.put("cl", 10.0);
        VOLUME_CONVERSIONS.put("dl", 100.0);

        // Count (to pieces)
        COUNT_CONVERSIONS.put("piece", 1.0);
        COUNT_CONVERSIONS.put("pieces", 1.0);
        COUNT_CONVERSIONS.put("pcs", 1.0);
        COUNT_CONVERSIONS.put("pc", 1.0);
        COUNT_CONVERSIONS.put("slice", 1.0);
        COUNT_CONVERSIONS.put("slices", 1.0);
        COUNT_CONVERSIONS.put("dozen", 12.0);
    }

    /**
     * Convert quantity from one unit to another
     */
    public Float convertUnit(Float quantity, String fromUnit, String toUnit) {
        if (fromUnit == null || toUnit == null || quantity == null) {
            return quantity;
        }

        String from = fromUnit.toLowerCase().trim();
        String to = toUnit.toLowerCase().trim();

        // If same unit, no conversion needed
        if (from.equals(to)) {
            return quantity;
        }

        // Determine unit category and convert
        if (WEIGHT_CONVERSIONS.containsKey(from) && WEIGHT_CONVERSIONS.containsKey(to)) {
            return convertInCategory(quantity, from, to, WEIGHT_CONVERSIONS);
        } else if (VOLUME_CONVERSIONS.containsKey(from) && VOLUME_CONVERSIONS.containsKey(to)) {
            return convertInCategory(quantity, from, to, VOLUME_CONVERSIONS);
        } else if (COUNT_CONVERSIONS.containsKey(from) && COUNT_CONVERSIONS.containsKey(to)) {
            return convertInCategory(quantity, from, to, COUNT_CONVERSIONS);
        }

        // Cannot convert - return original
        return quantity;
    }

    /**
     * Convert within a category (weight, volume, or count)
     */
    private Float convertInCategory(Float quantity, String from, String to, Map<String, Double> conversions) {
        double fromRatio = conversions.get(from);
        double toRatio = conversions.get(to);

        double converted = quantity * (fromRatio / toRatio);

        // Round to 2 decimal places
        return (float) (Math.round(converted * 100.0) / 100.0);
    }

    /**
     * Check if two units are compatible (same category)
     */
    public boolean areUnitsCompatible(String unit1, String unit2) {
        if (unit1 == null || unit2 == null) {
            return false;
        }

        String u1 = unit1.toLowerCase().trim();
        String u2 = unit2.toLowerCase().trim();

        return (WEIGHT_CONVERSIONS.containsKey(u1) && WEIGHT_CONVERSIONS.containsKey(u2)) ||
                (VOLUME_CONVERSIONS.containsKey(u1) && VOLUME_CONVERSIONS.containsKey(u2)) ||
                (COUNT_CONVERSIONS.containsKey(u1) && COUNT_CONVERSIONS.containsKey(u2));
    }
}
