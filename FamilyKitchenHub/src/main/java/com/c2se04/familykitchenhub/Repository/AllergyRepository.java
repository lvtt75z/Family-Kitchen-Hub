package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    Optional<Allergy> findByName(String name);
    boolean existsByName(String name);
}