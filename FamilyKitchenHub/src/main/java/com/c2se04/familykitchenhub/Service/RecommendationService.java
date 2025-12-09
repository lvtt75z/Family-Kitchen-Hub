package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Repository.*;
import com.c2se04.familykitchenhub.DTO.Request.RecommendationRequest;
import com.c2se04.familykitchenhub.DTO.Response.RecommendationResponse;
import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.model.*;
import lombok.RequiredArgsConstructor; // Dùng Lombok cho gọn
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // Tự động inject các repository (final)
public class RecommendationService {

    private final RestTemplate restTemplate;

    // [CẬP NHẬT] Sử dụng Repository mới của bạn
    private final InventoryItemRepository inventoryItemRepository;

    private final FamilyMemberRepository familyMemberRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Value("${ai.service.url}")
    private String pythonApiUrl;

    public RecommendationResponse getRecommendations(Long userId) {
        // 1. Kiểm tra User có tồn tại không (vẫn cần thiết để đảm bảo tính toàn vẹn)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // 2. [CẬP NHẬT] Lấy Inventory Items bằng userId (theo code Repository mới của bạn)
        List<InventoryItem> inventoryItems = inventoryItemRepository.findByUserId(userId);

        // 3. Lấy Family Members (Giả sử repo này vẫn dùng findByUser, nếu nó cũng dùng Id thì sửa tương tự)
        List<FamilyMember> familyMembers = familyMemberRepository.findByUserId(userId);

        // 4. Lấy tất cả công thức
        List<Recipe> allRecipes = recipeRepository.findAll();

        // 5. Chuẩn bị Payload gửi sang Python
        RecommendationRequest request = RecommendationRequest.builder()
                .currentDate(LocalDate.now().toString())
                .inventoryItems(mapInventory(inventoryItems))
                .familyProfiles(mapFamily(familyMembers))
                .allRecipes(mapRecipes(allRecipes))
                .build();

        // 6. Gọi API Python
        try {
            return restTemplate.postForObject(pythonApiUrl, request, RecommendationResponse.class);
        } catch (Exception e) {
            e.printStackTrace();
            // Trả về null hoặc ném lỗi tùy logic của bạn, ở đây mình ném lỗi để dễ debug
            throw new RuntimeException("Lỗi kết nối tới AI Service: " + e.getMessage());
        }
    }

    // --- CÁC HÀM MAPPER (Chuyển đổi dữ liệu sang DTO) ---

    private List<RecommendationRequest.InventoryItemDTO> mapInventory(List<InventoryItem> items) {
        return items.stream().map(item -> RecommendationRequest.InventoryItemDTO.builder()
                .ingredientId(item.getIngredient().getId())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                // Lưu ý: Kiểm tra kỹ tên biến Date trong InventoryItem của bạn là 'expirationDate' hay 'expiryDate'
                .expiryDate(item.getExpirationDate() != null ? item.getExpirationDate().toString() : null)
                .build()
        ).collect(Collectors.toList());
    }

    private List<RecommendationRequest.FamilyProfileDTO> mapFamily(List<FamilyMember> members) {
        return members.stream().map(member -> {
            // Xử lý sở thích (Taste Preferences)
            List<String> tastes = new ArrayList<>();
            if (member.getTastePreferences() != null && !member.getTastePreferences().isEmpty()) {
                // Tách chuỗi bằng dấu phẩy nếu lưu dạng "Sweet,Spicy"
                tastes = List.of(member.getTastePreferences().split(","));
            }

            // Xử lý Dị ứng (Giả sử bạn chưa kịp làm bảng quan hệ, để list rỗng tạm thời)
            List<Long> allergyIds = new ArrayList<>();
            // Nếu đã có quan hệ, dùng: member.getAllergies().stream().map(Allergy::getId).toList();

            return RecommendationRequest.FamilyProfileDTO.builder()
                    .age(member.getAge())
                    .gender(member.getGender() != null ? member.getGender().name() : null)
                    .heightCm(member.getHeightCm())
                    .weightKg(member.getWeightKg())
                    .activityLevel(member.getActivityLevel() != null ? member.getActivityLevel().name() : "SEDENTARY")
                    .allergies(allergyIds)
                    .tastePreferences(tastes)
                    .build();
        }).collect(Collectors.toList());
    }

    private List<RecommendationRequest.RecipeDTO> mapRecipes(List<Recipe> recipes) {
        return recipes.stream().map(recipe -> {
            // Lấy danh sách tên Category
            List<String> categoryNames = recipe.getCategories().stream()
                    .map(Category::getName)
                    .collect(Collectors.toList());

            // Map nguyên liệu của công thức
            List<RecommendationRequest.RecipeIngredientDTO> ingredients = recipe.getRecipeIngredients().stream()
                    .map(ri -> RecommendationRequest.RecipeIngredientDTO.builder()
                            .ingredientId(ri.getIngredient().getId())
                            .quantity(ri.getQuantity().floatValue())
                            .isMainIngredient(ri.getIsMainIngredient())
                            .build())
                    .collect(Collectors.toList());

            return RecommendationRequest.RecipeDTO.builder()
                    .id(recipe.getId())
                    .totalCalories(recipe.getTotalCalories())
                    .categories(categoryNames)
                    .ingredients(ingredients)
                    .build();
        }).collect(Collectors.toList());
    }
}