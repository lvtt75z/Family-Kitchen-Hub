package com.c2se04.familykitchenhub.enums;

public enum ActivityLevel {
    // Cấu trúc: TÊN(Hệ số TDEE, Mô tả hiển thị trên UI)

    SEDENTARY(1.2, "Ít vận động (Nhân viên văn phòng, ít tập thể dục)"),

    LIGHT(1.375, "Vận động nhẹ (Tập thể dục 1-3 ngày/tuần)"),

    MODERATE(1.55, "Vận động vừa (Tập thể dục 3-5 ngày/tuần)"),

    ACTIVE(1.725, "Năng động (Tập thể dục 6-7 ngày/tuần hoặc lao động chân tay)");

    private final double multiplier;
    private final String description;

    ActivityLevel(double multiplier, String description) {
        this.multiplier = multiplier;
        this.description = description;
    }

    public double getMultiplier() {
        return multiplier;
    }

    public String getDescription() {
        return description;
    }
}