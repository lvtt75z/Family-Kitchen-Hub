package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.InventoryItem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository để quản lý các mục trong tủ lạnh ảo (InventoryItem).
 */
@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Tìm tất cả InventoryItem thuộc về một User cụ thể.
     * Đây là chức năng READ ALL cơ bản cho tủ lạnh ảo.
     */
    @EntityGraph(attributePaths = { "ingredient" })
    List<InventoryItem> findByUserId(Long userId);

    /**
     * Tìm kiếm một mục tồn kho cụ thể của một người dùng dựa trên Ingredient ID.
     * Lưu ý: Có thể có nhiều InventoryItem cùng một ingredient (mua nhiều lần).
     */
    @EntityGraph(attributePaths = { "ingredient" })
    Optional<InventoryItem> findByUserIdAndIngredientId(Long userId, Long ingredientId);

    /**
     * Tìm tất cả InventoryItem của một người dùng với một Ingredient ID cụ thể.
     * Sắp xếp theo expiration date (sắp hết hạn trước) để ưu tiên sử dụng.
     */
    @EntityGraph(attributePaths = { "ingredient" })
    List<InventoryItem> findAllByUserIdAndIngredientIdOrderByExpirationDateAsc(Long userId, Long ingredientId);

    @Override
    @EntityGraph(attributePaths = { "ingredient" })
    Optional<InventoryItem> findById(Long id);

    /**
     * Tìm tất cả InventoryItem sắp hết hạn (trong vòng 2 ngày tới) và chưa được
     * thông báo
     * Dùng cho scheduler tự động gửi cảnh báo
     */
    @EntityGraph(attributePaths = { "ingredient", "user" })
    List<InventoryItem> findByExpirationDateLessThanEqualAndExpirationNotifiedFalse(LocalDate expirationDate);

    /**
     * Delete all inventory items for a specific user
     */
    void deleteByUserId(Long userId);
}