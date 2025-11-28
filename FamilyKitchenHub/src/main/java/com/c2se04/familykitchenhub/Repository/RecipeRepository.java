package com.c2se04.familykitchenhub.Repository;
import com.c2se04.familykitchenhub.Repository.projection.RecipeEngagementProjection;
import com.c2se04.familykitchenhub.enums.MealType;
import com.c2se04.familykitchenhub.model.Recipe;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Tìm kiếm công thức theo kiểu món ăn
    List<Recipe> findByMealType(MealType mealType);
    
    // Tìm kiếm công thức theo tên (không phân biệt hoa thường)
    @Query("SELECT r FROM Recipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Recipe> findByTitleContainingIgnoreCase(@Param("name") String name);

    @Query(
            value = "SELECT r.id AS recipeId, " +
                    "       r.title AS title, " +
                    "       r.image_url AS imageUrl, " +
                    "       COALESCE(c.comment_count, 0) AS commentCount, " +
                    "       COALESCE(m.photo_count, 0) AS photoCount, " +
                    "       COALESCE(b.bookmark_count, 0) AS bookmarkCount, " +
                    "       (COALESCE(c.comment_count, 0) * 1.0 " +
                    "        + COALESCE(m.photo_count, 0) * 1.5 " +
                    "        + COALESCE(b.bookmark_count, 0) * 2.0) AS engagementScore " +
                    "FROM recipes r " +
                    "LEFT JOIN ( " +
                    "    SELECT recipe_id, COUNT(*) AS comment_count " +
                    "    FROM recipe_comments " +
                    "    WHERE status = 'APPROVED' " +
                    "    GROUP BY recipe_id " +
                    ") c ON c.recipe_id = r.id " +
                    "LEFT JOIN ( " +
                    "    SELECT rc.recipe_id, COUNT(cm.id) AS photo_count " +
                    "    FROM recipe_comments rc " +
                    "    JOIN comment_media cm ON rc.id = cm.comment_id " +
                    "    WHERE rc.status = 'APPROVED' " +
                    "    GROUP BY rc.recipe_id " +
                    ") m ON m.recipe_id = r.id " +
                    "LEFT JOIN ( " +
                    "    SELECT recipe_id, COUNT(*) AS bookmark_count " +
                    "    FROM recipe_bookmarks " +
                    "    GROUP BY recipe_id " +
                    ") b ON b.recipe_id = r.id " +
                    "WHERE (COALESCE(c.comment_count, 0) * 1.0 " +
                    "       + COALESCE(m.photo_count, 0) * 1.5 " +
                    "       + COALESCE(b.bookmark_count, 0) * 2.0) > 0 " +
                    "ORDER BY engagementScore DESC, r.id DESC",
            countQuery = "SELECT COUNT(*) FROM ( " +
                    "    SELECT r.id " +
                    "    FROM recipes r " +
                    "    LEFT JOIN ( " +
                    "        SELECT recipe_id, COUNT(*) AS comment_count " +
                    "        FROM recipe_comments " +
                    "        WHERE status = 'APPROVED' " +
                    "        GROUP BY recipe_id " +
                    "    ) c ON c.recipe_id = r.id " +
                    "    LEFT JOIN ( " +
                    "        SELECT rc.recipe_id, COUNT(cm.id) AS photo_count " +
                    "        FROM recipe_comments rc " +
                    "        JOIN comment_media cm ON rc.id = cm.comment_id " +
                    "        WHERE rc.status = 'APPROVED' " +
                    "        GROUP BY rc.recipe_id " +
                    "    ) m ON m.recipe_id = r.id " +
                    "    LEFT JOIN ( " +
                    "        SELECT recipe_id, COUNT(*) AS bookmark_count " +
                    "        FROM recipe_bookmarks " +
                    "        GROUP BY recipe_id " +
                    "    ) b ON b.recipe_id = r.id " +
                    "    WHERE (COALESCE(c.comment_count, 0) * 1.0 " +
                    "           + COALESCE(m.photo_count, 0) * 1.5 " +
                    "           + COALESCE(b.bookmark_count, 0) * 2.0) > 0 " +
                    ") engaged_recipes",
            nativeQuery = true)
    Page<RecipeEngagementProjection> findRecipesByEngagement(Pageable pageable);
}