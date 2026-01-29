-- ============================================================
-- Migration: Add file path columns to jobs table
-- ============================================================

-- Add bl_file_path for Bill of Lading document
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS bl_file_path VARCHAR(500);

-- Add packing_list_path for Packing List document
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS packing_list_path VARCHAR(500);

-- Success message
SELECT 'Added bl_file_path and packing_list_path columns to jobs table' as result;
