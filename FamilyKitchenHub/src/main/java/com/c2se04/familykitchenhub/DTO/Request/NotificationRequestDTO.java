package com.c2se04.familykitchenhub.DTO.Request;

/**
 * Request payload for adding a notification to a user's queue.
 */
public class NotificationRequestDTO {

    private Long inventoryItemId;
    private String type;
    private String message;

    public Long getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(Long inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

