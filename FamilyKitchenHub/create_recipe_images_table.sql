-- ============================================
-- CREATE RECIPE IMAGES TABLE
-- ============================================
-- Script to create table for storing multiple images per recipe
-- Database: familyKitchenHub
-- ============================================

CREATE TABLE IF NOT EXISTS `recipe_images` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `recipe_id` BIGINT NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) DEFAULT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_recipe_id` (`recipe_id`),
  KEY `idx_display_order` (`recipe_id`, `display_order`),
  CONSTRAINT `fk_recipe_images_recipe` 
    FOREIGN KEY (`recipe_id`) 
    REFERENCES `recipes` (`id`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

