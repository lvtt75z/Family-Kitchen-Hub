package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.RecipeRequestDTO;
import com.c2se04.familykitchenhub.DTO.RecipeResponseDTO;
import com.c2se04.familykitchenhub.DTO.RecipeIngredientDTO;
import com.c2se04.familykitchenhub.DTO.RecipeIngredientResponseDTO;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

/**
 * Interface Mapper để chuyển đổi giữa DTO và Entity.
 * Yêu cầu thư viện MapStruct.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE) // Cho Spring quản lý bean này
public interface RecipeMapper {

    // Chuyển đổi DTO (Input) thành Entity để lưu vào DB
    @Mapping(target = "id", ignore = true)
    @Mapping(source = "ingredients", target = "recipeIngredients")
    Recipe toEntity(RecipeRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipe", ignore = true)
    @Mapping(source = "ingredientId", target = "ingredient.id")
    @Mapping(source = "quantity", target = "quantity")
    @Mapping(source = "unit", target = "unit")
    RecipeIngredient toRecipeIngredient(RecipeIngredientDTO dto);

    Set<RecipeIngredient> toRecipeIngredientSet(Set<RecipeIngredientDTO> dtos);

    // Chuyển đổi Entity thành DTO (Output) để trả về API
    @Mapping(source = "recipeIngredients", target = "ingredients")
    @Mapping(target = "imageUrls", ignore = true) // Map manually in @AfterMapping
    RecipeResponseDTO toResponseDTO(Recipe entity);

    @Mapping(source = "ingredient.id", target = "ingredientId")
    @Mapping(source = "ingredient.name", target = "ingredientName")
    @Mapping(source = "ingredient.unit", target = "unit")
    @Mapping(source = "quantity", target = "quantity")
    RecipeIngredientResponseDTO toRecipeIngredientResponseDTO(RecipeIngredient entity);

    // Chuyển đổi danh sách Entity thành danh sách DTO
    List<RecipeResponseDTO> toResponseDTOList(List<Recipe> entities);

    // Thiết lập quan hệ ngược lại
    @AfterMapping
    default void setRecipeOnIngredients(@MappingTarget Recipe recipe) {
        if (recipe.getRecipeIngredients() != null) {
            for (RecipeIngredient ri : recipe.getRecipeIngredients()) {
                ri.setRecipe(recipe);
            }
        }
    }

    // Map images to imageUrls list
    @AfterMapping
    default void mapImagesToUrls(@MappingTarget RecipeResponseDTO dto, Recipe entity) {
        try {
            if (entity.getImages() != null && !entity.getImages().isEmpty()) {
                dto.setImageUrls(entity.getImages().stream()
                        .map(img -> img.getImageUrl())
                        .filter(url -> url != null && !url.isEmpty())
                        .collect(java.util.stream.Collectors.toList()));
            }
        } catch (Exception e) {
            // If images are lazy loaded and not fetched, ignore
            dto.setImageUrls(new java.util.ArrayList<>());
        }
    }

    // Cập nhật Entity từ DTO (Không cập nhật ID, bỏ qua quan hệ phức tạp)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "recipeIngredients", ignore = true)
    void updateRecipeFromDto(RecipeRequestDTO dto, @MappingTarget Recipe entity);
}
