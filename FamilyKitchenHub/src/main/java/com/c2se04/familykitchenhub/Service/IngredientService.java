package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.DTO.Response.IngredientWithTagsDTO;
import com.c2se04.familykitchenhub.DTO.TagDTO;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.IngredientTagRepository;
import com.c2se04.familykitchenhub.Repository.RecipeIngredientRepository;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final IngredientTagRepository ingredientTagRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;

    @Autowired
    private TagService tagService;

    @Autowired
    public IngredientService(IngredientRepository ingredientRepository,
            IngredientTagRepository ingredientTagRepository,
            RecipeIngredientRepository recipeIngredientRepository) {
        this.ingredientRepository = ingredientRepository;
        this.ingredientTagRepository = ingredientTagRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
    }

    // CREATE: Thêm thành phần mới
    @Transactional
    public Ingredient createIngredient(Ingredient ingredient) {
        return ingredientRepository.save(ingredient);
    }

    // READ ALL: Lấy tất cả thành phần
    public List<Ingredient> getAllIngredients() {
        return ingredientRepository.findAll();
    }

    // READ BY ID: Lấy thành phần theo ID
    public Optional<Ingredient> getIngredientById(Long id) {
        return ingredientRepository.findById(id);
    }

    // SEARCH BY NAME
    public List<Ingredient> searchIngredients(String keyword) {
        return ingredientRepository.findByNameContainingIgnoreCase(keyword);
    }

    // UPDATE: Cập nhật thành phần
    @Transactional
    public Ingredient updateIngredient(Long id, Ingredient updatedDetails) {
        Ingredient existingIngredient = ingredientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient", "id", id));

        // Cập nhật các trường
        existingIngredient.setName(updatedDetails.getName());
        existingIngredient.setUnit(updatedDetails.getUnit());
        existingIngredient.setCaloriesPer100g(updatedDetails.getCaloriesPer100g());
        existingIngredient.setNutritionalInfo(updatedDetails.getNutritionalInfo());

        return ingredientRepository.save(existingIngredient);
    }

    // DELETE: Xóa thành phần
    @Transactional
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ingredient", "id", id);
        }

        // Cascade delete: Remove all ingredient_tags entries first
        ingredientTagRepository.deleteByIngredientId(id);

        // Cascade delete: Remove all recipe_ingredients entries
        recipeIngredientRepository.deleteByIngredientId(id);

        // Then delete the ingredient
        ingredientRepository.deleteById(id);
    }

    // GET ALL WITH TAGS: Lấy tất cả thành phần kèm tags
    public List<IngredientWithTagsDTO> getAllIngredientsWithTags() {
        List<Ingredient> ingredients = ingredientRepository.findAll();

        return ingredients.stream().map(ingredient -> {
            // Get tags for this ingredient
            List<TagDTO> tags = tagService.getTagsForIngredient(ingredient.getId());

            return new IngredientWithTagsDTO(
                    ingredient.getId(),
                    ingredient.getName(),
                    ingredient.getUnit(),
                    tags);
        }).collect(Collectors.toList());
    }
}