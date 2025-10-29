package com.c2se04.familykitchenhub.Controller;

import com.c2se04.familykitchenhub.DTO.Request.AllergyRequestDTO;
import com.c2se04.familykitchenhub.DTO.Response.AllergyResponseDTO;
import com.c2se04.familykitchenhub.Mapper.AllergyMapper;
import com.c2se04.familykitchenhub.model.Allergy;
import com.c2se04.familykitchenhub.Service.AllergyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allergies")
public class AllergyController {

    private final AllergyService allergyService;
    private final AllergyMapper allergyMapper;

    @Autowired
    public AllergyController(AllergyService allergyService, AllergyMapper allergyMapper) {
        this.allergyService = allergyService;
        this.allergyMapper = allergyMapper;
    }

    // POST /api/allergies - CREATE
    @PostMapping
    public ResponseEntity<AllergyResponseDTO> createAllergy(@RequestBody AllergyRequestDTO allergyDTO) {
        Allergy allergyEntity = allergyMapper.toEntity(allergyDTO);
        Allergy newAllergy = allergyService.createAllergy(allergyEntity);
        AllergyResponseDTO responseDTO = allergyMapper.toResponseDTO(newAllergy);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    // GET /api/allergies - READ ALL
    @GetMapping
    public ResponseEntity<List<AllergyResponseDTO>> getAllAllergies() {
        List<Allergy> allergies = allergyService.getAllAllergies();
        List<AllergyResponseDTO> responseDTOs = allergyMapper.toResponseDTOList(allergies);
        return ResponseEntity.ok(responseDTOs);
    }

    // GET /api/allergies/{id} - READ BY ID
    @GetMapping("/{id}")
    public ResponseEntity<AllergyResponseDTO> getAllergyById(@PathVariable Long id) {
        return allergyService.getAllergyById(id)
                .map(allergyMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/allergies/search?name={name} - READ BY NAME
    @GetMapping("/search")
    public ResponseEntity<AllergyResponseDTO> getAllergyByName(@RequestParam String name) {
        return allergyService.getAllergyByName(name)
                .map(allergyMapper::toResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // PUT /api/allergies/{id} - UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<AllergyResponseDTO> updateAllergy(@PathVariable Long id, @RequestBody AllergyRequestDTO allergyDTO) {
        Allergy updateDetails = allergyMapper.toEntity(allergyDTO);
        Allergy updatedAllergy = allergyService.updateAllergy(id, updateDetails);
        AllergyResponseDTO responseDTO = allergyMapper.toResponseDTO(updatedAllergy);
        return ResponseEntity.ok(responseDTO);
    }

    // DELETE /api/allergies/{id} - DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllergy(@PathVariable Long id) {
        allergyService.deleteAllergy(id);
        return ResponseEntity.noContent().build();
    }
}