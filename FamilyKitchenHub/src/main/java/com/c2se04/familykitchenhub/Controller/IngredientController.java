package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.IngredientDTO;
import com.c2se04.familykitchenhub.DTO.Response.IngredientWithTagsDTO;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.Service.IngredientService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ingredients")
public class IngredientController {

    private final IngredientService ingredientService;

    @Autowired
    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    // POST /api/ingredients (CREATE)
    @PostMapping
    public ResponseEntity<Ingredient> createIngredient(@RequestBody IngredientDTO ingredientDTO) {
        Ingredient ingredient = new Ingredient();
        // Copy các thuộc tính từ DTO sang Entity (bao gồm name, unit, nutritionalInfo)
        BeanUtils.copyProperties(ingredientDTO, ingredient);

        Ingredient newIngredient = ingredientService.createIngredient(ingredient);
        return new ResponseEntity<>(newIngredient, HttpStatus.CREATED); // 201 Created
    }

    // GET /api/ingredients (READ ALL)
    @GetMapping
    public ResponseEntity<List<Ingredient>> getAllIngredients() {
        List<Ingredient> ingredients = ingredientService.getAllIngredients();
        return ResponseEntity.ok(ingredients);
    }

    // GET /api/ingredients/search?keyword=... (SEARCH BY NAME)
    @GetMapping("/search")
    public ResponseEntity<List<Ingredient>> searchIngredients(@RequestParam String keyword) {
        List<Ingredient> ingredients = ingredientService.searchIngredients(keyword);
        return ResponseEntity.ok(ingredients);
    }

    // GET /api/ingredients/{id} (READ BY ID)
    @GetMapping("/{id}")
    public ResponseEntity<Ingredient> getIngredientById(@PathVariable Long id) {
        return ingredientService.getIngredientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build()); // Trả về 404 nếu không tìm thấy
    }

    // PUT /api/ingredients/{id} (UPDATE)
    @PutMapping("/{id}")
    public ResponseEntity<Ingredient> updateIngredient(@PathVariable Long id, @RequestBody IngredientDTO ingredientDTO) {
        Ingredient updatedDetails = new Ingredient();
        BeanUtils.copyProperties(ingredientDTO, updatedDetails);

        // Service sẽ ném 404 nếu không tìm thấy ID
        Ingredient updatedIngredient = ingredientService.updateIngredient(id, updatedDetails);
        return ResponseEntity.ok(updatedIngredient); // 200 OK
    }

    // DELETE /api/ingredients/{id} (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // GET /api/ingredients/with-tags (GET ALL WITH TAGS)
    /**
     * Get all ingredients with their tags
     * Useful for inventory form dropdown where users need to see ingredient characteristics
     */
    @GetMapping("/with-tags")
    public ResponseEntity<List<IngredientWithTagsDTO>> getIngredientsWithTags() {
        List<IngredientWithTagsDTO> ingredients = ingredientService.getAllIngredientsWithTags();
        return ResponseEntity.ok(ingredients);
    }
}

