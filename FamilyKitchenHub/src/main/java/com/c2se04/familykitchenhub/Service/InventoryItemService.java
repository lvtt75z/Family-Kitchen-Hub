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
        
        // 3. Set unit từ Ingredient (bắt buộc vì cột unit không thể null)
        if (ingredient.getUnit() != null && !ingredient.getUnit().trim().isEmpty()) {
            item.setUnit(ingredient.getUnit());
        } else {
            // Fallback: sử dụng "g" (gram) làm đơn vị mặc định cho nguyên liệu thực phẩm
            // Thay vì "unit" để có giá trị hợp lý hơn
            item.setUnit("g");
        }

        // 4. Lưu lại
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

        // 2. Kiểm tra tồn kho cho tất cả nguyên liệu (tổng hợp từ tất cả InventoryItem)
        for (RecipeIngredient requiredIngredient : recipe.getRecipeIngredients()) {
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            Double requiredQuantity = requiredIngredient.getQuantity();

            // Lấy tất cả InventoryItem của ingredient này (có thể có nhiều items)
            List<InventoryItem> inventoryItems = inventoryItemRepository
                    .findAllByUserIdAndIngredientIdOrderByExpirationDateAsc(userId, requiredIngredientId);

            // Tổng hợp số lượng từ tất cả items
            Float totalQuantity = inventoryItems.stream()
                    .map(InventoryItem::getQuantity)
                    .reduce(0.0f, Float::sum);

            if (inventoryItems.isEmpty() || totalQuantity < requiredQuantity.floatValue()) {
                String ingredientName = requiredIngredient.getIngredient().getName();
                throw new RuntimeException("Không đủ nguyên liệu: " + ingredientName +
                        ". Cần: " + requiredQuantity +
                        ". Có: " + totalQuantity);
            }
        }

        // 3. Trừ số lượng sau khi đảm bảo đủ hết (ưu tiên trừ từ item sắp hết hạn trước)
        for (RecipeIngredient requiredIngredient : recipe.getRecipeIngredients()) {
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            Double requiredQuantity = requiredIngredient.getQuantity();

            // Lấy tất cả InventoryItem của ingredient này, sắp xếp theo expiration date (sắp hết hạn trước)
            List<InventoryItem> inventoryItems = inventoryItemRepository
                    .findAllByUserIdAndIngredientIdOrderByExpirationDateAsc(userId, requiredIngredientId);

            Float remainingToDeduct = requiredQuantity.floatValue();

            // Trừ từ các items theo thứ tự ưu tiên (item sắp hết hạn trước)
            for (InventoryItem item : inventoryItems) {
                if (remainingToDeduct <= 0) {
                    break;
                }

                Float itemQuantity = item.getQuantity();
                if (itemQuantity >= remainingToDeduct) {
                    // Item này đủ để trừ hết số lượng còn lại
                    Float newQuantity = itemQuantity - remainingToDeduct;
                    if (newQuantity <= 0) {
                        inventoryItemRepository.delete(item);
                    } else {
                        item.setQuantity(newQuantity);
                        inventoryItemRepository.save(item);
                    }
                    remainingToDeduct = 0.0f;
                } else {
                    // Item này không đủ, trừ hết item này và tiếp tục với item tiếp theo
                    inventoryItemRepository.delete(item);
                    remainingToDeduct -= itemQuantity;
                }
            }
        }

        return true;
    }

    /**
     * THỰC HIỆN LOGIC: Trừ nguyên liệu từ tủ lạnh ảo và trả về thông tin chi tiết.
     * @param userId   ID của người dùng thực hiện món ăn.
     * @param recipeId ID của công thức được chọn.
     * @return DeductResult chứa thông tin chi tiết về các nguyên liệu đã trừ.
     */
    @Transactional
    public DeductResult deductIngredientsForRecipeWithDetails(Long userId, Long recipeId) {
        // 1. Lấy công thức và các thành phần yêu cầu
        Recipe recipe = recipeService.getRecipeById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", "id", recipeId));

        if (recipe == null) {
            throw new RuntimeException("Recipe không tồn tại với id: " + recipeId);
        }

        java.util.Set<RecipeIngredient> recipeIngredients = recipe.getRecipeIngredients();
        if (recipeIngredients == null || recipeIngredients.isEmpty()) {
            throw new RuntimeException("Recipe không có nguyên liệu nào. Recipe ID: " + recipeId);
        }

        java.util.List<DeductedIngredientInfo> deductedIngredients = new java.util.ArrayList<>();

        // 2. Kiểm tra tồn kho cho tất cả nguyên liệu (tổng hợp từ tất cả InventoryItem)
        for (RecipeIngredient requiredIngredient : recipeIngredients) {
            // Validate requiredIngredient
            if (requiredIngredient == null) {
                throw new RuntimeException("Recipe ingredient không hợp lệ (null) trong recipe ID: " + recipeId);
            }
            
            if (requiredIngredient.getIngredient() == null) {
                throw new RuntimeException("Ingredient không hợp lệ (null) trong recipe ingredient. Recipe ID: " + recipeId);
            }
            
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            if (requiredIngredientId == null) {
                throw new RuntimeException("Ingredient ID không hợp lệ (null). Recipe ID: " + recipeId);
            }
            
            Double requiredQuantity = requiredIngredient.getQuantity();
            if (requiredQuantity == null || requiredQuantity <= 0) {
                String ingredientName = requiredIngredient.getIngredient().getName() != null ? 
                                       requiredIngredient.getIngredient().getName() : "Unknown";
                throw new RuntimeException("Số lượng nguyên liệu không hợp lệ cho: " + ingredientName + 
                                         ". Số lượng: " + requiredQuantity + ". Recipe ID: " + recipeId);
            }

            // Lấy tất cả InventoryItem của ingredient này (có thể có nhiều items)
            List<InventoryItem> inventoryItems = inventoryItemRepository
                    .findAllByUserIdAndIngredientIdOrderByExpirationDateAsc(userId, requiredIngredientId);

            // Tổng hợp số lượng từ tất cả items
            Float totalQuantity = inventoryItems.stream()
                    .map(InventoryItem::getQuantity)
                    .reduce(0.0f, Float::sum);

            if (inventoryItems.isEmpty() || totalQuantity < requiredQuantity.floatValue()) {
                String ingredientName = requiredIngredient.getIngredient().getName() != null ? 
                                       requiredIngredient.getIngredient().getName() : "Unknown";
                throw new RuntimeException("Không đủ nguyên liệu: " + ingredientName +
                        ". Cần: " + requiredQuantity +
                        ". Có: " + totalQuantity);
            }
        }

        // 3. Trừ số lượng sau khi đảm bảo đủ hết (ưu tiên trừ từ item sắp hết hạn trước)
        for (RecipeIngredient requiredIngredient : recipeIngredients) {
            // Validate requiredIngredient (đã validate ở trên nhưng validate lại để an toàn)
            if (requiredIngredient == null || requiredIngredient.getIngredient() == null) {
                continue; // Skip invalid ingredient
            }
            
            Long requiredIngredientId = requiredIngredient.getIngredient().getId();
            Double requiredQuantity = requiredIngredient.getQuantity();
            
            if (requiredIngredientId == null || requiredQuantity == null || requiredQuantity <= 0) {
                continue; // Skip invalid ingredient
            }
            
            String ingredientName = requiredIngredient.getIngredient().getName() != null ? 
                                   requiredIngredient.getIngredient().getName() : "Unknown";
            String unit = requiredIngredient.getUnit() != null ? requiredIngredient.getUnit() : 
                         (requiredIngredient.getIngredient().getUnit() != null ? 
                          requiredIngredient.getIngredient().getUnit() : "g");

            // Lấy tất cả InventoryItem của ingredient này, sắp xếp theo expiration date (sắp hết hạn trước)
            List<InventoryItem> inventoryItems = inventoryItemRepository
                    .findAllByUserIdAndIngredientIdOrderByExpirationDateAsc(userId, requiredIngredientId);

            Float remainingToDeduct = requiredQuantity.floatValue();
            Float totalRemaining = 0.0f;

            // Trừ từ các items theo thứ tự ưu tiên (item sắp hết hạn trước)
            for (InventoryItem item : inventoryItems) {
                if (remainingToDeduct <= 0) {
                    totalRemaining += item.getQuantity();
                    continue;
                }

                Float itemQuantity = item.getQuantity();
                if (itemQuantity >= remainingToDeduct) {
                    // Item này đủ để trừ hết số lượng còn lại
                    Float newQuantity = itemQuantity - remainingToDeduct;
                    if (newQuantity <= 0) {
                        inventoryItemRepository.delete(item);
                    } else {
                        item.setQuantity(newQuantity);
                        inventoryItemRepository.save(item);
                        totalRemaining += newQuantity;
                    }
                    remainingToDeduct = 0.0f;
                } else {
                    // Item này không đủ, trừ hết item này và tiếp tục với item tiếp theo
                    inventoryItemRepository.delete(item);
                    remainingToDeduct -= itemQuantity;
                }
            }

            deductedIngredients.add(new DeductedIngredientInfo(
                requiredIngredientId,
                ingredientName,
                requiredQuantity.doubleValue(),
                totalRemaining.doubleValue(),
                unit,
                totalRemaining <= 0
            ));
        }

        return new DeductResult(recipe.getId(), recipe.getTitle(), deductedIngredients);
    }

    // Inner class để trả về kết quả
    public static class DeductResult {
        private Long recipeId;
        private String recipeTitle;
        private java.util.List<DeductedIngredientInfo> deductedIngredients;

        public DeductResult(Long recipeId, String recipeTitle, java.util.List<DeductedIngredientInfo> deductedIngredients) {
            this.recipeId = recipeId;
            this.recipeTitle = recipeTitle;
            this.deductedIngredients = deductedIngredients;
        }

        public Long getRecipeId() {
            return recipeId;
        }

        public String getRecipeTitle() {
            return recipeTitle;
        }

        public java.util.List<DeductedIngredientInfo> getDeductedIngredients() {
            return deductedIngredients;
        }
    }

    // Inner class để lưu thông tin nguyên liệu đã trừ
    public static class DeductedIngredientInfo {
        private Long ingredientId;
        private String ingredientName;
        private Double deductedQuantity;
        private Double remainingQuantity;
        private String unit;
        private boolean removedFromInventory;

        public DeductedIngredientInfo(Long ingredientId, String ingredientName, Double deductedQuantity, 
                                     Double remainingQuantity, String unit, boolean removedFromInventory) {
            this.ingredientId = ingredientId;
            this.ingredientName = ingredientName;
            this.deductedQuantity = deductedQuantity;
            this.remainingQuantity = remainingQuantity;
            this.unit = unit;
            this.removedFromInventory = removedFromInventory;
        }

        public Long getIngredientId() {
            return ingredientId;
        }

        public String getIngredientName() {
            return ingredientName;
        }

        public Double getDeductedQuantity() {
            return deductedQuantity;
        }

        public Double getRemainingQuantity() {
            return remainingQuantity;
        }

        public String getUnit() {
            return unit;
        }

        public boolean isRemovedFromInventory() {
            return removedFromInventory;
        }
    }
}