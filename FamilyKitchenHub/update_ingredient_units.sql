-- Script để cập nhật default_unit cho các Ingredient hiện có
-- Chạy script này để set đơn vị tính cho các nguyên liệu trong database

-- Tắt safe update mode tạm thời để cho phép UPDATE với WHERE clause không dùng KEY
SET SQL_SAFE_UPDATES = 0;

-- Cập nhật các nguyên liệu phổ biến với đơn vị tính phù hợp
-- Sử dụng subquery với id để đảm bảo an toàn và tương thích với safe mode

-- Các nguyên liệu dùng kg (kilogram)
UPDATE ingredients 
SET default_unit = 'kg' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%gà%' OR name LIKE '%thịt%' OR name LIKE '%cá%') AS temp
);

UPDATE ingredients 
SET default_unit = 'kg' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%gạo%' OR name LIKE '%nếp%' OR name LIKE '%đậu%') AS temp
);

UPDATE ingredients 
SET default_unit = 'kg' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%khoai%' OR name LIKE '%củ%') AS temp
);

-- Các nguyên liệu dùng g (gram)
UPDATE ingredients 
SET default_unit = 'g' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%hành%' OR name LIKE '%tỏi%' OR name LIKE '%ớt%') AS temp
);

UPDATE ingredients 
SET default_unit = 'g' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%rau%' OR name LIKE '%cải%' OR name LIKE '%xà lách%') AS temp
);

-- Các nguyên liệu dùng quả
UPDATE ingredients 
SET default_unit = 'quả' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%cà chua%' OR name LIKE '%trứng%' OR name LIKE '%chanh%') AS temp
);

UPDATE ingredients 
SET default_unit = 'quả' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%cam%' OR name LIKE '%táo%' OR name LIKE '%chuối%') AS temp
);

-- Các nguyên liệu dùng ml (milliliter)
UPDATE ingredients 
SET default_unit = 'ml' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%sữa%' OR name LIKE '%nước%' OR name LIKE '%dầu%') AS temp
);

UPDATE ingredients 
SET default_unit = 'ml' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%giấm%' OR name LIKE '%rượu%' OR name LIKE '%bia%') AS temp
);

-- Các nguyên liệu dùng gói
UPDATE ingredients 
SET default_unit = 'gói' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%mì%' OR name LIKE '%bánh%') AS temp
);

UPDATE ingredients 
SET default_unit = 'gói' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE name LIKE '%gia vị%' OR name LIKE '%bột%') AS temp
);

-- Set mặc định cho các nguyên liệu còn lại chưa có unit
UPDATE ingredients 
SET default_unit = 'g' 
WHERE id IN (
    SELECT id FROM (SELECT id FROM ingredients WHERE default_unit IS NULL) AS temp
);

-- Kiểm tra kết quả
SELECT id, name, default_unit FROM ingredients ORDER BY id;

-- Bật lại safe update mode để đảm bảo an toàn
SET SQL_SAFE_UPDATES = 1;
