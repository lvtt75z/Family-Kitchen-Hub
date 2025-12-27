package com.c2se04.familykitchenhub.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetectedIngredientDTO {
    private Long ingredientId; // ID if matched with DB, null if unknown
    private String ingredientName; // Name detected from bill
    private Float quantity; // Converted quantity
    private String unit; // Converted unit (default unit from DB)
    private Float originalQuantity; // Original quantity from receipt
    private String originalUnit; // Original unit from receipt
    private Boolean matched; // Whether ingredient was found in DB
    private Float confidence; // AI confidence score (0.0 - 1.0)
    private String rawText; // Raw text from OCR
}
