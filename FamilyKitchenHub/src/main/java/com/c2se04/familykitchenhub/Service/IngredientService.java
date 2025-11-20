package com.c2se04.familykitchenhub.Service;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException; // Cần thiết cho các thao tác tìm kiếm
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class IngredientService {

    private final IngredientRepository ingredientRepository;

    @Autowired
    public IngredientService(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
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
        existingIngredient.setNutritionalInfo(updatedDetails.getNutritionalInfo());

        return ingredientRepository.save(existingIngredient);
    }

    // DELETE: Xóa thành phần
    @Transactional
    public void deleteIngredient(Long id) {
        if (!ingredientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ingredient", "id", id);
        }
        ingredientRepository.deleteById(id);
    }
}