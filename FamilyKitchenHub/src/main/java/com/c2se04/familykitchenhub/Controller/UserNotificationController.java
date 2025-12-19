package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.NotificationRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.UserNotificationResponseDTO;
import com.c2se04.familykitchenhub.Service.UserNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/notifications")
public class UserNotificationController {

    private final UserNotificationService notificationService;

    @Autowired
    public UserNotificationController(UserNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<UserNotificationResponseDTO> enqueueNotification(
            @PathVariable Long userId,
            @RequestBody NotificationRequestDTO request) {
        // Debug logging
        System.out.println("DEBUG Controller: userId=" + userId + 
                          ", request=" + (request != null ? 
                              ("inventoryItemId=" + request.getInventoryItemId() + 
                               ", type=" + request.getType() + 
                               ", message=" + request.getMessage()) : "null"));
        
        return new ResponseEntity<>(notificationService.enqueueNotification(userId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UserNotificationResponseDTO>> list(
            @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.listNotifications(userId));
    }
}

