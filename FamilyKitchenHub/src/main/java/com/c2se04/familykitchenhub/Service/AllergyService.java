package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.BadRequestException;
import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Allergy;
import com.c2se04.familykitchenhub.Repository.AllergyRepository;
import com.c2se04.familykitchenhub.Repository.MemberAllergyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AllergyService {

    private final AllergyRepository allergyRepository;
    private final MemberAllergyRepository memberAllergyRepository;

    @Autowired
    public AllergyService(AllergyRepository allergyRepository,
            MemberAllergyRepository memberAllergyRepository) {
        this.allergyRepository = allergyRepository;
        this.memberAllergyRepository = memberAllergyRepository;
    }

    // CREATE
    @Transactional
    public Allergy createAllergy(Allergy allergy) {
        // Check if allergy with same name already exists
        if (allergyRepository.existsByName(allergy.getName())) {
            throw new BadRequestException("Allergy with name '" + allergy.getName() + "' already exists");
        }
        return allergyRepository.save(allergy);
    }

    // READ ALL
    public List<Allergy> getAllAllergies() {
        return allergyRepository.findAll();
    }

    // READ BY ID
    public Optional<Allergy> getAllergyById(Long id) {
        return allergyRepository.findById(id);
    }

    // READ BY NAME
    public Optional<Allergy> getAllergyByName(String name) {
        return allergyRepository.findByName(name);
    }

    // UPDATE
    @Transactional
    public Allergy updateAllergy(Long id, Allergy updatedAllergyDetails) {
        Allergy existingAllergy = allergyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy", "id", id));

        // Check if the new name conflicts with another allergy
        if (!existingAllergy.getName().equals(updatedAllergyDetails.getName())
                && allergyRepository.existsByName(updatedAllergyDetails.getName())) {
            throw new BadRequestException("Allergy with name '" + updatedAllergyDetails.getName() + "' already exists");
        }

        existingAllergy.setName(updatedAllergyDetails.getName());
        return allergyRepository.save(existingAllergy);
    }

    // DELETE
    @Transactional
    public void deleteAllergy(Long id) {
        if (!allergyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Allergy", "id", id);
        }

        // Cascade delete: Remove all member_allergies entries first
        memberAllergyRepository.deleteByAllergyId(id);

        // Then delete the allergy
        allergyRepository.deleteById(id);
    }
}
