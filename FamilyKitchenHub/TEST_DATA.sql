-- ============================================
-- TEST DATA FOR FAMILY KITCHEN HUB
-- ============================================
-- This script inserts sample data for testing
-- Tables: users, allergies, family_members, member_allergies
-- ============================================

-- ============================================
-- 1. INSERT USERS (if not already present)
-- ============================================
-- Note: Adjust these based on your existing users or create new ones

INSERT INTO users (username, email, password_, full_name, role, created_at, is_verified) 
VALUES 
('johndoe', 'john.doe@email.com', '$2a$10$YourHashedPasswordHere1', 'John Doe', 'USER', NOW(), true),
('janedoe', 'jane.doe@email.com', '$2a$10$YourHashedPasswordHere2', 'Jane Doe', 'USER', NOW(), true),
('bobsmith', 'bob.smith@email.com', '$2a$10$YourHashedPasswordHere3', 'Bob Smith', 'USER', NOW(), true),
('alicewilson', 'alice.wilson@email.com', '$2a$10$YourHashedPasswordHere4', 'Alice Wilson', 'ADMIN', NOW(), true);

-- ============================================
-- 2. INSERT ALLERGIES
-- ============================================

INSERT INTO allergies (name) VALUES 
('Peanuts'),
('Tree Nuts'),
('Shellfish'),
('Dairy'),
('Eggs'),
('Soy'),
('Wheat'),
('Gluten'),
('Fish'),
('Sesame'),
('Corn'),
('Lactose');

-- ============================================
-- 3. INSERT FAMILY MEMBERS
-- ============================================
-- Note: Replace user_id values with actual user IDs from your database
-- Assuming users have IDs 1, 2, 3, 4 from the INSERT above

-- Family members for User 1 (John Doe)
INSERT INTO family_members (user_id, name, age, health_goals, notes) VALUES 
(1, 'Emma Doe', 8, 'Build immunity, eat more vegetables', 'Loves pasta and pizza'),
(1, 'Liam Doe', 12, 'Increase protein intake, build muscle', 'Active in sports, plays soccer'),
(1, 'Olivia Doe', 5, 'Healthy growth, balanced diet', 'Picky eater, dislikes vegetables');

-- Family members for User 2 (Jane Doe)
INSERT INTO family_members (user_id, name, age, health_goals, notes) VALUES 
(2, 'Noah Johnson', 10, 'Maintain healthy weight, reduce sugar', 'Loves sweets, needs monitoring'),
(2, 'Sophia Johnson', 14, 'Vegetarian diet, iron intake', 'Recently became vegetarian'),
(2, 'Mason Johnson', 6, 'Allergy management, safe foods', 'Multiple food allergies');

-- Family members for User 3 (Bob Smith)
INSERT INTO family_members (user_id, name, age, health_goals, notes) VALUES 
(3, 'Ava Smith', 9, 'Bone health, calcium intake', 'Lactose intolerant'),
(3, 'Ethan Smith', 15, 'Athletic performance, high protein', 'Training for track team'),
(3, 'Isabella Smith', 7, 'General health, variety', 'Good eater, no restrictions');

-- Family members for User 4 (Alice Wilson)
INSERT INTO family_members (user_id, name, age, health_goals, notes) VALUES 
(4, 'James Wilson', 11, 'Gluten-free diet, energy boost', 'Celiac disease diagnosed'),
(4, 'Charlotte Wilson', 13, 'Heart health, omega-3s', 'Family history of heart issues'),
(4, 'Benjamin Wilson', 4, 'Allergy awareness, safe eating', 'Severe peanut allergy');

-- ============================================
-- 4. INSERT MEMBER ALLERGIES
-- ============================================
-- Note: These use member_id and allergy_id from the inserts above
-- Adjust IDs based on your actual inserted data

-- Emma Doe (ID: 1) - Dairy allergy
INSERT INTO member_allergies (member_id, allergy_id) VALUES (1, 4);

-- Liam Doe (ID: 2) - No allergies
-- (No entries)

-- Olivia Doe (ID: 3) - Eggs and Soy allergies
INSERT INTO member_allergies (member_id, allergy_id) VALUES 
(3, 5),
(3, 6);

-- Noah Johnson (ID: 4) - Shellfish allergy
INSERT INTO member_allergies (member_id, allergy_id) VALUES (4, 3);

-- Sophia Johnson (ID: 5) - No allergies
-- (No entries)

-- Mason Johnson (ID: 6) - Multiple allergies (Peanuts, Tree Nuts, Eggs)
INSERT INTO member_allergies (member_id, allergy_id) VALUES 
(6, 1),
(6, 2),
(6, 5);

-- Ava Smith (ID: 7) - Lactose intolerance
INSERT INTO member_allergies (member_id, allergy_id) VALUES (7, 12);

-- Ethan Smith (ID: 8) - No allergies
-- (No entries)

-- Isabella Smith (ID: 9) - No allergies
-- (No entries)

-- James Wilson (ID: 10) - Gluten and Wheat allergies
INSERT INTO member_allergies (member_id, allergy_id) VALUES 
(10, 7),
(10, 8);

-- Charlotte Wilson (ID: 11) - Fish allergy
INSERT INTO member_allergies (member_id, allergy_id) VALUES (11, 9);

-- Benjamin Wilson (ID: 12) - Severe peanut allergy
INSERT INTO member_allergies (member_id, allergy_id) VALUES (12, 1);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the data was inserted correctly

-- Count records
SELECT 'Total Allergies' as Label, COUNT(*) as Count FROM allergies
UNION ALL
SELECT 'Total Family Members', COUNT(*) FROM family_members
UNION ALL
SELECT 'Total Member-Allergy Associations', COUNT(*) FROM member_allergies;

-- View all allergies
SELECT * FROM allergies ORDER BY id;

-- View all family members with their user info
SELECT fm.id, fm.name, fm.age, u.username as parent, fm.health_goals, fm.notes
FROM family_members fm
JOIN users u ON fm.user_id = u.id
ORDER BY u.username, fm.name;

-- View members with their allergies
SELECT 
    fm.id as member_id,
    fm.name as member_name,
    fm.age,
    u.username as parent,
    GROUP_CONCAT(a.name ORDER BY a.name SEPARATOR ', ') as allergies
FROM family_members fm
JOIN users u ON fm.user_id = u.id
LEFT JOIN member_allergies ma ON fm.id = ma.member_id
LEFT JOIN allergies a ON ma.allergy_id = a.id
GROUP BY fm.id, fm.name, fm.age, u.username
ORDER BY u.username, fm.name;

-- View allergy distribution
SELECT 
    a.name as allergy_name,
    COUNT(ma.member_id) as member_count
FROM allergies a
LEFT JOIN member_allergies ma ON a.id = ma.allergy_id
GROUP BY a.id, a.name
ORDER BY member_count DESC, a.name;

-- ============================================
-- CLEANUP SCRIPT (Run if you want to remove test data)
-- ============================================
/*
-- Delete in reverse order due to foreign keys
DELETE FROM member_allergies;
DELETE FROM family_members;
DELETE FROM allergies;
-- Optionally delete test users
-- DELETE FROM users WHERE username IN ('johndoe', 'janedoe', 'bobsmith', 'alicewilson');

-- Reset auto increment (MySQL)
ALTER TABLE member_allergies AUTO_INCREMENT = 1;
ALTER TABLE family_members AUTO_INCREMENT = 1;
ALTER TABLE allergies AUTO_INCREMENT = 1;
*/

