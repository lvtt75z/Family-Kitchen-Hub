package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.InventoryItemDTO;
import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.Service.InventoryItemService;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<InventoryItem> createItem(@RequestBody InventoryItemDTO itemDTO) {
        InventoryItem item = new InventoryItem();
        // Item entity cần có User và Ingredient được thiết lập trong Service

        InventoryItem newItem = inventoryItemService.createInventoryItem(
                item,
                itemDTO.getUserId(),
                itemDTO.getIngredientId()
        );

        // Copy các trường còn lại (quantity, expirationDate)
        newItem.setQuantity(itemDTO.getQuantity());
        newItem.setExpirationDate(itemDTO.getExpirationDate());

        return new ResponseEntity<>(newItem, HttpStatus.CREATED); // 201 Created
    }

    // GET /api/inventory/user/{userId} - READ ALL by User ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InventoryItem>> getInventoryForUser(@PathVariable Long userId) {
        List<InventoryItem> items = inventoryItemService.getInventoryByUserId(userId);
        return ResponseEntity.ok(items);
    }

    // GET /api/inventory/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<InventoryItem> getItemById(@PathVariable Long id) {
        InventoryItem item = inventoryItemService.getInventoryItemById(id);
        return ResponseEntity.ok(item);
    }

    // PUT /api/inventory/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItem> updateItem(@PathVariable Long id, @RequestBody InventoryItemDTO itemDTO) {
        InventoryItem updateDetails = new InventoryItem();

        // Chỉ copy các trường cần cập nhật (quantity và expirationDate)
        updateDetails.setQuantity(itemDTO.getQuantity());
        updateDetails.setExpirationDate(itemDTO.getExpirationDate());

        InventoryItem updatedItem = inventoryItemService.updateInventoryItem(id, updateDetails);
        return ResponseEntity.ok(updatedItem); // 200 OK
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
}