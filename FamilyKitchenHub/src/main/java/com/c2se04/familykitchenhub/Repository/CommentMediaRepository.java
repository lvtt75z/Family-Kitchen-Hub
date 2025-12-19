package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.model.CommentMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentMediaRepository extends JpaRepository<CommentMedia, Long> {
}

