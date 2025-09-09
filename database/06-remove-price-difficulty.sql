-- Remove price and difficulty columns from trip_packages table
-- This migration removes pricing and difficulty level fields as requested by client

-- Remove the check constraint for difficulty_level first
ALTER TABLE trip_packages DROP CONSTRAINT IF EXISTS trip_packages_difficulty_level_check;

-- Remove the columns
ALTER TABLE trip_packages DROP COLUMN IF EXISTS price_usd;
ALTER TABLE trip_packages DROP COLUMN IF EXISTS price_eur;
ALTER TABLE trip_packages DROP COLUMN IF EXISTS price_gbp;
ALTER TABLE trip_packages DROP COLUMN IF EXISTS difficulty_level;