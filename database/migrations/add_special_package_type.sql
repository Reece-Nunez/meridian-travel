-- Migration: Add special package type support
-- This migration adds support for special packages (e.g., diving expeditions)

-- Add special_type column to trip_packages
-- This column stores the specific type of special package (e.g., 'diving')
ALTER TABLE trip_packages
ADD COLUMN IF NOT EXISTS special_type TEXT DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN trip_packages.special_type IS 'Type of special package (e.g., diving). Only used when type = special';

-- Update the type column to include 'special' as a valid option
-- Note: If you have a CHECK constraint on the type column, you may need to drop and recreate it
-- ALTER TABLE trip_packages DROP CONSTRAINT IF EXISTS trip_packages_type_check;
-- ALTER TABLE trip_packages ADD CONSTRAINT trip_packages_type_check
--   CHECK (type IN ('package', 'cruise', 'special'));

-- Create an index for querying by special_type (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_trip_packages_special_type ON trip_packages(special_type) WHERE special_type IS NOT NULL;

-- Example: To see all diving packages
-- SELECT * FROM trip_packages WHERE type = 'special' AND special_type = 'diving';
