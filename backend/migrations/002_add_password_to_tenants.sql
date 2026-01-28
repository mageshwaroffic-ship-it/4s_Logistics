-- ============================================================
-- Migration: Add password_hash column to tenants table
-- This allows storing the account password at tenant level
-- ============================================================

-- Add password_hash column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Success message
SELECT 'Added password_hash column to tenants table' as result;
