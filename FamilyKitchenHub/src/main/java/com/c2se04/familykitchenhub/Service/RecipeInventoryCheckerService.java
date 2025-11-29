package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.IngredientAvailability;
import com.c2se04.familykitchenhub.DTO.IngredientStatus;
import com.c2se04.familykitchenhub.Repository.InventoryItemRepository;
import com.c2se04.familykitchenhub.model.InventoryItem;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service to check recipe ingredient availability against user inventory
 */
@Service
public class RecipeInventoryCheckerService {

    private final InventoryItemRepository inventoryRepository;

    @Autowired
    public RecipeInventoryCheckerService(InventoryItemRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Check which ingredients user has and which are missing for a recipe
     */
    public IngredientAvailability checkRecipeAvailability(Long userId, Recipe recipe) {
        IngredientAvailability availability = new IngredientAvailability();

        // Get user's inventory
        List<InventoryItem> userInventory = inventoryRepository.findByUserId(userId);

        // Check each recipe ingredient
        for (RecipeIngredient required : recipe.getRecipeIngredients()) {
            Long requiredIngredientId = required.getIngredient().getId();
            Float quantityRequired = required.getQuantity().floatValue();
            String ingredientName = required.getIngredient().getName();
            String unit = required.getIngredient().getUnit();

            // Find this ingredient in user's inventory
            Optional<InventoryItem> userItem = userInventory.stream()
                    .filter(item -> item.getIngredient().getId().equals(requiredIngredientId))
                    .findFirst();

            Float quantityAvailable = userItem.map(InventoryItem::getQuantity).orElse(0f);

            IngredientStatus status = new IngredientStatus(
                    ingredientName,
                    quantityRequired,
                    quantityAvailable,
                    unit);

            // Categorize as available or missing
            if (status.isAvailable()) {
                availability.addAvailable(status);
            } else {
                availability.addMissing(status);
            }
        }

        return availability;
    }
}
