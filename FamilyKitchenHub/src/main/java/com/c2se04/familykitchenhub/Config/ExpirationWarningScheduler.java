package com.c2se04.familykitchenhub.Config;

import com.c2se04.familykitchenhub.DTO.Request.NotificationRequestDTO;
import com.c2se04.familykitchenhub.Repository.InventoryItemRepository;
import com.c2se04.familykitchenhub.Service.UserNotificationService;
import com.c2se04.familykitchenhub.model.InventoryItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled task to check and send expiration warnings for inventory items
 * Runs every 6 hours (21600000 ms) to check items expiring within 2 days
 * 
 * Logic:
 * - Quét tất cả inventory items có expiration_date <= (today + 2 days)
 * - Và expiration_notified = false (chưa được thông báo)
 * - Tạo notification cho mỗi item và đánh dấu đã thông báo
 */
@Component
public class ExpirationWarningScheduler {

    private final InventoryItemRepository inventoryItemRepository;
    private final UserNotificationService userNotificationService;

    @Autowired
    public ExpirationWarningScheduler(InventoryItemRepository inventoryItemRepository,
                                      UserNotificationService userNotificationService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.userNotificationService = userNotificationService;
    }

    /**
     * Check for expiring items every 6 hours
     * Cron expression: "0 0 0/6 * * ?" (every 6 hours)
     * Fixed rate: 21600000 ms = 6 hours
     */
    @Scheduled(fixedRate = 21600000) // 6 hours = 6 * 60 * 60 * 1000 ms
    // @Scheduled(cron = "0 0 0/6 * * ?") // Alternative: cron expression (every 6 hours)
    // @Scheduled(fixedRate = 3600000) // For testing: every 1 hour
    @Transactional
    public void checkExpiringItems() {
        LocalDate today = LocalDate.now();
        LocalDate warningThreshold = today.plusDays(2); // 2 ngày từ hôm nay

        // Tìm tất cả items sắp hết hạn (trong vòng 2 ngày) và chưa được thông báo
        List<InventoryItem> expiringItems = inventoryItemRepository
                .findByExpirationDateLessThanEqualAndExpirationNotifiedFalse(warningThreshold);

        if (expiringItems.isEmpty()) {
            System.out.println("ExpirationWarningScheduler: No items expiring within 2 days");
            return;
        }

        System.out.println("ExpirationWarningScheduler: Found " + expiringItems.size() + " items expiring within 2 days");

        int successCount = 0;
        int batchSize = 50; // Process 50 items at a time to reduce memory usage

        for (int i = 0; i < expiringItems.size(); i += batchSize) {
            int end = Math.min(i + batchSize, expiringItems.size());
            List<InventoryItem> batch = expiringItems.subList(i, end);

            for (InventoryItem item : batch) {
                try {
                    // Tạo notification request
                    NotificationRequestDTO request = new NotificationRequestDTO();
                    request.setInventoryItemId(item.getId());
                    request.setType("INVENTORY_EXPIRING");
                    // Message sẽ được tự động generate trong UserNotificationService

                    // Gửi notification và đánh dấu đã thông báo
                    userNotificationService.enqueueNotification(item.getUser().getId(), request);
                    successCount++;

                } catch (Exception e) {
                    System.err.println("Failed to send expiration warning for inventory item ID: " + item.getId());
                    e.printStackTrace();
                }
            }

            // Clear batch from memory after processing
            batch.clear();

            // Suggest garbage collection between batches
            if (i + batchSize < expiringItems.size()) {
                System.gc();
            }
        }

        System.out.println("ExpirationWarningScheduler: Sent " + successCount + " / " + expiringItems.size() + " expiration warnings");
    }
}

