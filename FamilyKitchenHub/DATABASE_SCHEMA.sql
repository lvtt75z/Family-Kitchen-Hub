-- ================================================================
-- FAMILY KITCHEN HUB - DATABASE SCHEMA & SAMPLE DATA
-- Các tính năng: Tag System, Recipe Categories, Schedules, Reminders
-- ================================================================

-- ================================================================
-- 7.1 HỆ THỐNG TAG NGUYÊN LIỆU
-- ================================================================

-- Bảng lưu trữ các tag (cay, healthy, gluten-free...)
CREATE TABLE IF NOT EXISTS `tags` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50) NOT NULL COMMENT 'NUTRITION, CATEGORY, PRESERVATIVE, USAGE',
  `description` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name_type` (`name`,`type`),
  KEY `idx_type` (`type`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng liên kết nguyên liệu với tag
CREATE TABLE IF NOT EXISTS `ingredient_tags` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `ingredient_id` BIGINT NOT NULL,
    `tag_id` BIGINT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_ingredient_tag` (`ingredient_id`,`tag_id`),
    KEY `idx_ingredient` (`ingredient_id`),
    KEY `idx_tag` (`tag_id`),
    CONSTRAINT `fk_ingredient_tags_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_ingredient_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ================================================================
-- 7.6 PHÂN LOẠI MÓN ĂN
-- ================================================================

-- Bảng danh mục món ăn (phân cấp)
CREATE TABLE IF NOT EXISTS `recipe_categories` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `parent_id` BIGINT DEFAULT NULL,
    FOREIGN KEY (`parent_id`) REFERENCES `recipe_categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng liên kết công thức với danh mục
CREATE TABLE IF NOT EXISTS `recipe_category_map` (
    `recipe_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    PRIMARY KEY (`recipe_id`, `category_id`),
    FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `recipe_categories`(`id`) ON DELETE CASCADE,
    INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ================================================================
-- 7.7 LỊCH NẤU ĂN & NHẮC NHỞ
-- ================================================================

-- Bảng lịch nấu món (theo mùa, dịp, thời tiết)
CREATE TABLE IF NOT EXISTS `recipe_schedules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `recipe_id` BIGINT NOT NULL,
    `season` VARCHAR(20) DEFAULT NULL COMMENT 'SPRING, SUMMER, FALL, WINTER, ALL',
    `weather` VARCHAR(50) DEFAULT NULL,
    `occasion` VARCHAR(100) DEFAULT NULL,
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
    INDEX `idx_recipe_id` (`recipe_id`),
    INDEX `idx_season` (`season`),
    INDEX `idx_occasion` (`occasion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bảng lời nhắc cá nhân
CREATE TABLE IF NOT EXISTS `user_recipe_reminders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `recipe_id` BIGINT NOT NULL,
    `reminder_at` TIMESTAMP NOT NULL,
    `note` TEXT,
    `is_sent` BOOLEAN DEFAULT FALSE,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_reminder_at` (`reminder_at`),
    INDEX `idx_is_sent` (`is_sent`),
    INDEX `idx_user_reminder` (`user_id`, `reminder_at`, `is_sent`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Dữ liệu mẫu cho tags
INSERT INTO `tags` (`id`, `name`, `type`, `description`) VALUES
(1, 'Cay', 'PRESERVATIVE', 'Chứa capsaicin hoặc ớt'),
(2, 'Healthy', 'NUTRITION', 'Ít calo, nhiều dinh dưỡng'),
(3, 'Không Gluten', 'NUTRITION', 'Không chứa gluten'),
(4, 'Hữu Cơ', 'CATEGORY', 'Trồng theo phương pháp hữu cơ'),
(5, 'Chay', 'NUTRITION', 'Không có sản phẩm động vật');



-- Dữ liệu mẫu: gắn tag cho nguyên liệu
INSERT INTO `ingredient_tags` (`id`, `ingredient_id`, `tag_id`) VALUES
(1, 5, 1),   -- Ớt (id=5) -> Cay
(2, 10, 2),  -- Rau xà lách (id=10) -> Healthy
(3, 10, 3),  -- Rau xà lách (id=10) -> Không Gluten
(4, 15, 4),  -- Cà chua hữu cơ (id=15) -> Hữu Cơ
(5, 20, 5);  -- Đậu phụ (id=20) -> Chay


-- Dữ liệu mẫu: cây danh mục
INSERT INTO `recipe_categories` (`id`, `name`, `parent_id`) VALUES
(1, 'Món Việt', NULL),              -- Danh mục gốc
(2, 'Món Tây', NULL),               -- Danh mục gốc
(3, 'Món Nước', 1),                 -- Món Việt → Món Nước
(4, 'Món Cơm', 1),                  -- Món Việt → Món Cơm
(5, 'Pasta', 2);                    -- Món Tây → Pasta


-- Dữ liệu mẫu: gán danh mục cho món
INSERT INTO `recipe_category_map` (`recipe_id`, `category_id`) VALUES
(1, 1),  -- Món 1 -> Món Việt
(1, 3),  -- Món 1 -> Món Việt → Món Nước
(2, 1),  -- Món 2 -> Món Việt
(2, 4),  -- Món 2 -> Món Việt → Món Cơm
(3, 2),  -- Món 3 -> Món Tây
(3, 5);  -- Món 3 -> Món Tây → Pasta



-- Dữ liệu mẫu: lịch nấu món
INSERT INTO `recipe_schedules` (`id`, `recipe_id`, `season`, `weather`, `occasion`, `notes`) VALUES
(1, 1, 'WINTER', 'Lạnh, mưa', 'Bữa tối gia đình', 'Món ấm hoàn hảo'),
(2, 2, 'SUMMER', 'Nóng, nắng', 'Dã ngoại', 'Món nhẹ, mát'),
(3, 3, 'FALL', NULL, 'Lễ Tạ Ơn', 'Món truyền thống ngày lễ'),
(4, 4, 'SPRING', 'Ấm áp', 'Sinh nhật', 'Trình bày đẹp mắt'),
(5, 5, 'ALL', NULL, 'Bữa sáng', 'Món ăn quanh năm');


-- Dữ liệu mẫu: lời nhắc người dùng
INSERT INTO `user_recipe_reminders` (`id`, `user_id`, `recipe_id`, `reminder_at`, `note`, `is_sent`, `is_read`) VALUES
(1, 1, 5, '2025-11-30 18:00:00', 'Chuẩn bị tiệc tối', FALSE, FALSE),
(2, 1, 2, '2025-12-01 10:00:00', 'Brunch cuối tuần', FALSE, FALSE),
(3, 2, 3, '2025-11-29 17:30:00', 'Thử công thức mới', FALSE, FALSE),
(4, 2, 1, '2025-12-05 12:00:00', NULL, FALSE, FALSE),
(5, 3, 4, '2025-11-28 19:00:00', 'Sinh nhật mẹ', TRUE, TRUE);

-- ================================================================
-- HOÀN TẤT
-- ================================================================
-- Tổng cộng: 6 bảng với 30 dòng dữ liệu mẫu
-- Hỗ trợ: Tag System, Categories, Schedules, Reminders
-- ================================================================
