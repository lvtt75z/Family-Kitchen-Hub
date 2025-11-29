package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Request.NotificationRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.UserNotificationResponseDTO;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.Repository.InventoryItemRepository;
import com.c2se04.familykitchenhub.Repository.UserNotificationRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.enums.NotificationType;
import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.model.UserNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserNotificationService {

    private final UserNotificationRepository userNotificationRepository;
    private final UserRepository userRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemService inventoryItemService;

    @Autowired
    public UserNotificationService(UserNotificationRepository userNotificationRepository,
                                   UserRepository userRepository,
                                   InventoryItemRepository inventoryItemRepository,
                                   InventoryItemService inventoryItemService) {
        this.userNotificationRepository = userNotificationRepository;
        this.userRepository = userRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.inventoryItemService = inventoryItemService;
    }

    @Transactional
    public UserNotificationResponseDTO enqueueNotification(Long userId, NotificationRequestDTO request) {
        if (request == null || request.getInventoryItemId() == null) {
            throw new BadRequestException("Thiếu inventoryItemId cho thông báo hết hạn");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        InventoryItem item = inventoryItemRepository.findById(request.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", request.getInventoryItemId()));

        NotificationType type = parseType(request.getType());
        String message = resolveMessage(request.getMessage(), item);

        UserNotification notification = new UserNotification();
        notification.setUser(user);
        notification.setInventoryItem(item);
        notification.setType(type);
        notification.setMessage(message);

        UserNotification saved = userNotificationRepository.save(notification);
        inventoryItemService.markExpirationNotified(item.getId());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<UserNotificationResponseDTO> listNotifications(Long userId) {
        return userNotificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationType parseType(String type) {
        if (!StringUtils.hasText(type)) {
            return NotificationType.INVENTORY_EXPIRING;
        }
        try {
            return NotificationType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Loại thông báo không hợp lệ: " + type);
        }
    }

    private String resolveMessage(String message, InventoryItem item) {
        if (StringUtils.hasText(message)) {
            return message.trim();
        }
        String ingredientName = item.getIngredient() != null ? item.getIngredient().getName() : "Nguyên liệu";
        String expiration = item.getExpirationDate() != null ? item.getExpirationDate().toString() : "không rõ";
        return String.format("%s sắp hết hạn ngày %s", ingredientName, expiration);
    }

    private UserNotificationResponseDTO mapToResponse(UserNotification notification) {
        UserNotificationResponseDTO dto = new UserNotificationResponseDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType().name());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setReadAt(notification.getReadAt());
        if (notification.getInventoryItem() != null) {
            dto.setInventoryItemId(notification.getInventoryItem().getId());
        }
        return dto;
    }
}

