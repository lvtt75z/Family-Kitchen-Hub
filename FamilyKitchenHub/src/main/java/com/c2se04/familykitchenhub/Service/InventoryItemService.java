package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Repository.InventoryItemRepository;
import com.c2se04.familykitchenhub.Repository.UserRepository;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository; // Giả định đã tồn tại
    private final IngredientRepository ingredientRepository; // Giả định đã tồn tại
    private final RecipeService recipeService; // Dùng để lấy công thức

    @Autowired
    public InventoryItemService(InventoryItemRepository inventoryItemRepository,
                                UserRepository userRepository,
                                IngredientRepository ingredientRepository,
                                RecipeService recipeService) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.userRepository = userRepository;
        this.ingredientRepository = ingredientRepository;
        this.recipeService = recipeService;
    }

    // CREATE: Thêm một nguyên liệu vào tủ lạnh
    @Transactional
    public InventoryItem createInventoryItem(InventoryItem item, Long userId, Long ingredientId) {
        // 1. Kiểm tra sự tồn tại của User và Ingredient
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Ingredient ingredient = ingredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", ingredientId));

        // 2. Thiết lập mối quan hệ
        item.setUser(user);
        item.setIngredient(ingredient);

        // 3. Lưu lại
        return inventoryItemRepository.save(item);
    }

    // READ ALL: Lấy tất cả nguyên liệu của một User
    public List<InventoryItem> getInventoryByUserId(Long userId) {
        // Có thể kiểm tra User tồn tại ở đây, hoặc để cho Repository xử lý
        return inventoryItemRepository.findByUserId(userId);
    }

    // READ BY ID
    public InventoryItem getInventoryItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
    }

    // UPDATE: Cập nhật số lượng và ngày hết hạn
    @Transactional
    public InventoryItem updateInventoryItem(Long id, InventoryItem updatedDetails) {
        InventoryItem existingItem = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));

        // Cập nhật các trường (không cập nhật User hoặc Ingredient)
        if (updatedDetails.getQuantity() != null) {
            existingItem.setQuantity(updatedDetails.getQuantity());
        }
        if (updatedDetails.getExpirationDate() != null) {
            existingItem.setExpirationDate(updatedDetails.getExpirationDate());
        }

        return inventoryItemRepository.save(existingItem);
    }

    // DELETE: Xóa một nguyên liệu
    @Transactional
    public void deleteInventoryItem(Long id) {
        if (!inventoryItemRepository.existsById(id)) {
            throw new ResourceNotFoundException("InventoryItem", "id", id);
        }
        inventoryItemRepository.deleteById(id);
    }

    @Transactional
    public InventoryItem markExpirationNotified(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
        item.setExpirationNotified(true);
        item.setExpirationNotifiedAt(LocalDateTime.now());
        return inventoryItemRepository.save(item);
    }

    @Transactional
    public InventoryItem acknowledgeExpiration(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
        item.setExpirationAcknowledgedAt(LocalDateTime.now());
        return inventoryItemRepository.save(item);
    }

    /**
     * THỰC HIỆN LOGIC: Trừ nguyên liệu từ tủ lạnh ảo khi người dùng làm món ăn.
     * @param userId   ID của người dùng thực hiện món ăn.
     * @param recipeId ID của công thức được chọn.
     * @return true nếu trừ thành công; ném exception nếu không đủ nguyên liệu.
     */
    @Transactional
    public boolean deductIngredientsForRecipe(Long userId, Long recipeId) {
        // 1. Lấy công thức và các thành phần yêu cầu
        Recipe recipe = recipeService.getRecipeById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        // 2. Kiểm tra tồn kho cho tất cả nguyên liệu
        for (RecipeIngredient requiredIngredient : recipe.getRecipeIngredients()) {
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            Double requiredQuantity = requiredIngredient.getQuantity();

            InventoryItem inventoryItem = inventoryItemRepository
                    .findByUserIdAndIngredientId(userId, requiredIngredientId)
                    .orElse(null);

            if (inventoryItem == null || inventoryItem.getQuantity() < requiredQuantity.floatValue()) {
                String ingredientName = requiredIngredient.getIngredient().getName();
                throw new RuntimeException("Không đủ nguyên liệu: " + ingredientName +
                        ". Cần: " + requiredQuantity +
                        ". Có: " + (inventoryItem == null ? 0 : inventoryItem.getQuantity()));
            }
        }

        // 3. Trừ số lượng sau khi đảm bảo đủ hết
        for (RecipeIngredient requiredIngredient : recipe.getRecipeIngredients()) {
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            Double requiredQuantity = requiredIngredient.getQuantity();

            InventoryItem inventoryItem = inventoryItemRepository
                    .findByUserIdAndIngredientId(userId, requiredIngredientId)
                    .get();

            Float newQuantity = inventoryItem.getQuantity() - requiredQuantity.floatValue();
            if (newQuantity <= 0) {
                inventoryItemRepository.delete(inventoryItem);
            } else {
                inventoryItem.setQuantity(newQuantity);
                inventoryItemRepository.save(inventoryItem);
            }
        }

        return true;
    }
}