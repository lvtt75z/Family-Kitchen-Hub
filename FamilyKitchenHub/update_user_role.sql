-- ============================================
-- UPDATE USER ROLE TO ADMIN
-- ============================================
-- Script to update user ID 13 to ADMIN role
-- Database: familyKitchenHub
-- ============================================

-- Update user ID 13 to ADMIN role
UPDATE users 
SET role = 'ADMIN' 
WHERE id = 13;

-- Verify the update
SELECT id, username, email, full_name, role, created_at 
FROM users 
WHERE id = 13;





