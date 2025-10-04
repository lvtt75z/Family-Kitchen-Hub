package com.c2se04.familykitchenhub.Mapper;

import com.c2se04.familykitchenhub.DTO.Response.UserResponse;
import com.c2se04.familykitchenhub.Entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    
    /**
     * Convert User entity to UserResponse DTO
     * @param user User entity
     * @return UserResponse DTO
     */
    public UserResponse toUserResponse(User user) {
        if (user == null) {
            return null;
        }
        
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getIsVerified(),
                user.getCreatedAt()
        );
    }
}

