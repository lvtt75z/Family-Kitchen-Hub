package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.InventoryItemDTO;
import com.c2se04.familykitchenhub.DTO.InventoryItemResponseDTO;
import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.Service.InventoryItemService;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    @Autowired
    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    // POST /api/inventory - CREATE
    @PostMapping
    public ResponseEntity<InventoryItemResponseDTO> createItem(@RequestBody InventoryItemDTO itemDTO) {
        InventoryItem item = new InventoryItem();
        // Thiết lập các trường đơn giản trước khi lưu
        item.setQuantity(itemDTO.getQuantity());
        item.setExpirationDate(itemDTO.getExpirationDate());

        // Item entity cần có User và Ingredient được thiết lập trong Service
        InventoryItem newItem = inventoryItemService.createInventoryItem(
                item,
                itemDTO.getUserId(),
                itemDTO.getIngredientId()
        );

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
    public ResponseEntity<InventoryItemResponseDTO> updateItem(@PathVariable Long id, @RequestBody InventoryItemDTO itemDTO) {
        InventoryItem updateDetails = new InventoryItem();

        // Chỉ copy các trường cần cập nhật (quantity và expirationDate)
        updateDetails.setQuantity(itemDTO.getQuantity());
        updateDetails.setExpirationDate(itemDTO.getExpirationDate());

        InventoryItem updatedItem = inventoryItemService.updateInventoryItem(id, updateDetails);
        return ResponseEntity.ok(convertToResponseDTO(updatedItem)); // 200 OK
    }

    // DELETE /api/inventory/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build(); // 204 No Content
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

    private InventoryItemResponseDTO convertToResponseDTO(InventoryItem item) {
        InventoryItemResponseDTO dto = new InventoryItemResponseDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setExpirationDate(item.getExpirationDate());
        if (item.getIngredient() != null) {
            dto.setIngredientId(item.getIngredient().getId());
            dto.setIngredientName(item.getIngredient().getName());
            dto.setUnit(item.getIngredient().getUnit());
        }
        return dto;
    }
}