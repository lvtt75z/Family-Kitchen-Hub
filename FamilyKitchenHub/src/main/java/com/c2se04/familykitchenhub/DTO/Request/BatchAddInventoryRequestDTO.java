package com.c2se04.familykitchenhub.DTO.Request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchAddInventoryRequestDTO {
    private Long userId;
    private List<InventoryItemBatchDTO> items;
    private LocalDate purchasedAt; // Purchase date (applies to all items)

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryItemBatchDTO {
        private Long ingredientId;
        private Float quantity;
        private String unit;
        private LocalDate expirationDate; // Optional per-item expiration
    }
}
