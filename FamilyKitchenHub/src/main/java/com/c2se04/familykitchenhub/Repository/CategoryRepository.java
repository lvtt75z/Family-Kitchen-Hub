package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Find category by name
    Optional<Category> findByName(String name);

    // Check if category exists by name
    boolean existsByName(String name);
}