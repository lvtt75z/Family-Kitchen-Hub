package com.c2se04.familykitchenhub.Repository;

import com.c2se04.familykitchenhub.Entity.User;
import com.c2se04.familykitchenhub.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsernameOrEmail(String username, String email);

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByVerificationCode(String verificationCode);

    Optional<User> findByResetToken(String resetToken);

    Optional<User> findByEmailAndVerificationCode(String email, String verificationCode);

    void deleteByVerificationCodeExpiryBefore(LocalDateTime dateTime);

    List<User> findByRole(Role role);

    // Dashboard analytics methods
    Long countByCreatedAtAfter(LocalDateTime date);

    List<User> findByCreatedAtAfter(LocalDateTime date);
}
