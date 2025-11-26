package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.enums.TagType;
import com.c2se04.familykitchenhub.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    // Find tags by type
    List<Tag> findByType(TagType type);

    // Find by name and type
    Optional<Tag> findByNameAndType(String name, TagType type);

    // Search by name containing
    List<Tag> findByNameContainingIgnoreCase(String keyword);

    // Find by type and name containing
    List<Tag> findByTypeAndNameContainingIgnoreCase(TagType type, String keyword);
}


