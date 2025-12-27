package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.InventoryItemDTO;
import com.c2se04.familykitchenhub.DTO.InventoryItemResponseDTO;
import com.c2se04.familykitchenhub.DTO.DetectedIngredientDTO;
import com.c2se04.familykitchenhub.DTO.Request.BatchAddInventoryRequestDTO;
import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Service.InventoryItemService;
import com.c2se04.familykitchenhub.Service.IngredientMatchingService;
import com.c2se04.familykitchenhub.Service.UnitConversionService;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;
    private final IngredientMatchingService matchingService;
    private final UnitConversionService conversionService;

    @Value("${ai.detection.service.url:http://localhost:5001}")
    private String aiServiceUrl;

    @Autowired
    public InventoryItemController(
            InventoryItemService inventoryItemService,
            IngredientMatchingService matchingService,
            UnitConversionService conversionService) {
        this.inventoryItemService = inventoryItemService;
        this.matchingService = matchingService;
        this.conversionService = conversionService;
    }

    // POST /api/inventory - CREATE
    @PostMapping
    public ResponseEntity<InventoryItemResponseDTO> createItem(@RequestBody InventoryItemDTO itemDTO) {
        InventoryItem item = new InventoryItem();
        // Thiết lập các trường đơn giản trước khi lưu
        item.setQuantity(itemDTO.getQuantity());
        item.setExpirationDate(itemDTO.getExpirationDate());
        item.setPurchasedAt(itemDTO.getPurchasedAt());

        // Item entity cần có User và Ingredient được thiết lập trong Service
        InventoryItem newItem = inventoryItemService.createInventoryItem(
                item,
                itemDTO.getUserId(),
                itemDTO.getIngredientId());

        return new ResponseEntity<>(convertToResponseDTO(newItem), HttpStatus.CREATED); // 201 Created
    }

    // GET /api/inventory/user/{userId} - READ ALL by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InventoryItemResponseDTO>> getInventoryForUser(@PathVariable Long userId) {
        List<InventoryItemResponseDTO> items = inventoryItemService.getInventoryByUserId(userId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(items);
    }

    // GET /api/inventory/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemResponseDTO> getItemById(@PathVariable Long id) {
        InventoryItem item = inventoryItemService.getInventoryItemById(id);
        return ResponseEntity.ok(convertToResponseDTO(item));
    }

    // PUT /api/inventory/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemResponseDTO> updateItem(@PathVariable Long id,
            @RequestBody InventoryItemDTO itemDTO) {
        InventoryItem updateDetails = new InventoryItem();

        // Chỉ copy các trường cần cập nhật (quantity và expirationDate)
        updateDetails.setQuantity(itemDTO.getQuantity());
        updateDetails.setExpirationDate(itemDTO.getExpirationDate());
        updateDetails.setPurchasedAt(itemDTO.getPurchasedAt());

        InventoryItem updatedItem = inventoryItemService.updateInventoryItem(id, updateDetails);
        return ResponseEntity.ok(convertToResponseDTO(updatedItem)); // 200 OK
    }

    // DELETE /api/inventory/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @PatchMapping("/{id}/ack-expiration")
    public ResponseEntity<InventoryItemResponseDTO> acknowledgeExpiration(@PathVariable Long id) {
        InventoryItem item = inventoryItemService.acknowledgeExpiration(id);
        return ResponseEntity.ok(convertToResponseDTO(item));
    }

    /**
     * Endpoint để thực hiện trừ nguyên liệu khỏi tủ lạnh ảo theo công thức.
     * Ví dụ: POST /api/inventory/deduct?userId=1&recipeId=10
     */
    @PostMapping("/deduct")
    public ResponseEntity<?> performRecipeExecution(
            @RequestParam Long userId,
            @RequestParam Long recipeId) {
        try {
            inventoryItemService.deductIngredientsForRecipe(userId, recipeId);
            return ResponseEntity.ok("Thực hiện món ăn thành công! Nguyên liệu đã được trừ khỏi tủ lạnh ảo.");
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * NEW: Detect ingredients from bill/receipt image
     * POST /api/inventory/detect-from-image
     */
    @PostMapping("/detect-from-image")
    public ResponseEntity<?> detectFromImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Call AI service
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Call AI service
            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(
                    aiServiceUrl + "/detect",
                    requestEntity,
                    Map.class);

            if (aiResponse.getStatusCode() != HttpStatus.OK || aiResponse.getBody() == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("AI service failed");
            }

            // Parse AI response
            List<Map<String, Object>> rawItems = (List<Map<String, Object>>) aiResponse.getBody().get("items");

            List<DetectedIngredientDTO> processedItems = new ArrayList<>();

            for (Map<String, Object> rawItem : rawItems) {
                String detectedName = (String) rawItem.get("name");
                Object qtyObj = rawItem.get("quantity");
                Float quantity = qtyObj instanceof Integer ? ((Integer) qtyObj).floatValue()
                        : qtyObj instanceof Double ? ((Double) qtyObj).floatValue() : (Float) qtyObj;
                String unit = (String) rawItem.get("unit");
                Object confObj = rawItem.get("confidence");
                Float confidence = confObj instanceof Double ? ((Double) confObj).floatValue() : (Float) confObj;

                // DEBUG: Log raw AI response
                System.out.println("🔍 AI Detected: " + detectedName + " | Qty: " + quantity + " | Unit: " + unit);

                // Try to match with database
                Ingredient matchedIngredient = matchingService.findBestMatch(detectedName);

                DetectedIngredientDTO dto = new DetectedIngredientDTO();
                dto.setOriginalQuantity(quantity);
                dto.setOriginalUnit(unit);
                dto.setConfidence(confidence);
                dto.setRawText(detectedName);

                if (matchedIngredient != null) {
                    // Found match - convert to default unit
                    String defaultUnit = matchedIngredient.getUnit();
                    Float convertedQuantity = conversionService.convertUnit(quantity, unit, defaultUnit);

                    // DEBUG: Log conversion
                    System.out.println("   ✅ Matched: " + matchedIngredient.getName() + " | Converted: "
                            + convertedQuantity + " " + defaultUnit);

                    dto.setIngredientId(matchedIngredient.getId());
                    dto.setIngredientName(matchedIngredient.getName());
                    dto.setQuantity(convertedQuantity);
                    dto.setUnit(defaultUnit);
                    dto.setMatched(true);
                } else {
                    // Not found - mark as unknown
                    System.out.println("   ❌ No match found for: " + detectedName);
                    dto.setIngredientId(null);
                    dto.setIngredientName(detectedName);
                    dto.setQuantity(quantity);
                    dto.setUnit(unit);
                    dto.setMatched(false);
                }

                processedItems.add(dto);
            }

            // FILTER: Only keep matched ingredients (remove unknown/junk items)
            List<DetectedIngredientDTO> matchedOnly = processedItems.stream()
                    .filter(DetectedIngredientDTO::getMatched)
                    .collect(Collectors.toList());

            // DEDUPLICATE: Merge items with same ingredientId, keep highest confidence
            Map<Long, DetectedIngredientDTO> uniqueItems = new java.util.LinkedHashMap<>();
            for (DetectedIngredientDTO item : matchedOnly) {
                Long id = item.getIngredientId();
                if (!uniqueItems.containsKey(id)) {
                    // First occurrence of this ingredient
                    uniqueItems.put(id, item);
                } else {
                    // Duplicate found - keep the one with higher confidence
                    DetectedIngredientDTO existing = uniqueItems.get(id);
                    if (item.getConfidence() > existing.getConfidence()) {
                        uniqueItems.put(id, item);
                    }
                }
            }

            List<DetectedIngredientDTO> finalItems = new ArrayList<>(uniqueItems.values());

            // Return only matched and deduplicated results
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("detectedItems", finalItems);
            response.put("totalDetected", processedItems.size()); // Total from OCR
            response.put("totalMatched", matchedOnly.size()); // Before dedup
            response.put("totalUnique", finalItems.size()); // After dedup
            response.put("totalFiltered", processedItems.size() - matchedOnly.size()); // Junk removed
            response.put("totalDuplicates", matchedOnly.size() - finalItems.size()); // Duplicates removed

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading file: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Detection failed: " + e.getMessage());
        }
    }

    /**
     * NEW: Batch add multiple inventory items at once
     * POST /api/inventory/batch-add
     */
    @PostMapping("/batch-add")
    public ResponseEntity<?> batchAddInventoryItems(@RequestBody BatchAddInventoryRequestDTO request) {
        try {
            List<InventoryItemResponseDTO> addedItems = new ArrayList<>();

            for (BatchAddInventoryRequestDTO.InventoryItemBatchDTO item : request.getItems()) {
                // Skip items without ingredient ID (unknown items)
                if (item.getIngredientId() == null) {
                    continue;
                }

                // Create inventory item
                InventoryItem inventoryItem = new InventoryItem();
                inventoryItem.setQuantity(item.getQuantity());
                inventoryItem.setUnit(item.getUnit());
                inventoryItem
                        .setPurchasedAt(request.getPurchasedAt() != null ? request.getPurchasedAt() : LocalDate.now());

                if (item.getExpirationDate() != null) {
                    inventoryItem.setExpirationDate(item.getExpirationDate());
                }

                // Save via service
                InventoryItem saved = inventoryItemService.createInventoryItem(
                        inventoryItem,
                        request.getUserId(),
                        item.getIngredientId());

                addedItems.add(convertToResponseDTO(saved));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("addedCount", addedItems.size());
            response.put("items", addedItems);

            return ResponseEntity.ok(response);

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Ingredient or user not found: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Batch add failed: " + e.getMessage());
        }
    }

    private InventoryItemResponseDTO convertToResponseDTO(InventoryItem item) {
        InventoryItemResponseDTO dto = new InventoryItemResponseDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setExpirationDate(item.getExpirationDate());
        dto.setPurchasedAt(item.getPurchasedAt());
        dto.setExpirationNotified(Boolean.TRUE.equals(item.getExpirationNotified()));
        dto.setExpirationNotifiedAt(item.getExpirationNotifiedAt());
        dto.setExpirationAcknowledgedAt(item.getExpirationAcknowledgedAt());

        // Tính toán ngày cảnh báo và trạng thái cảnh báo
        LocalDate today = LocalDate.now();
        if (item.getExpirationDate() != null) {
            LocalDate warningDate = item.getExpirationDate().minusDays(2);
            dto.setExpirationWarningDate(warningDate);

            // Kiểm tra item có đang cần cảnh báo không
            // Cần cảnh báo nếu: hôm nay >= ngày cảnh báo VÀ chưa hết hạn
            boolean needsWarning = !today.isBefore(warningDate) && !today.isAfter(item.getExpirationDate());
            dto.setNeedsWarning(needsWarning);

            // Kiểm tra item đã hết hạn chưa
            boolean isExpired = today.isAfter(item.getExpirationDate());
            dto.setExpired(isExpired);
        } else {
            dto.setNeedsWarning(false);
            dto.setExpired(false);
        }

        if (item.getIngredient() != null) {
            dto.setIngredientId(item.getIngredient().getId());
            dto.setIngredientName(item.getIngredient().getName());
            // Ưu tiên lấy unit từ InventoryItem, nếu null thì lấy từ Ingredient
            if (item.getUnit() != null && !item.getUnit().trim().isEmpty()) {
                dto.setUnit(item.getUnit());
            } else if (item.getIngredient().getUnit() != null && !item.getIngredient().getUnit().trim().isEmpty()) {
                dto.setUnit(item.getIngredient().getUnit());
            } else {
                dto.setUnit("g"); // Fallback: sử dụng "g" (gram) thay vì "unit"
            }
        }
        return dto;
    }
}