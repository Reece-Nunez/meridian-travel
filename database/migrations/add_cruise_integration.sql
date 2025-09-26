-- Add cruise integration columns to trip_packages table
-- This enables unified Package/Cruise management

-- Add type column to distinguish between packages and cruises
ALTER TABLE trip_packages
ADD COLUMN type VARCHAR(10) DEFAULT 'package' CHECK (type IN ('package', 'cruise'));

-- Add cruise-specific fields (optional columns)
ALTER TABLE trip_packages
ADD COLUMN ship_name VARCHAR(255),
ADD COLUMN cruise_line VARCHAR(255),
ADD COLUMN cabin_category VARCHAR(100),
ADD COLUMN departure_port VARCHAR(255),
ADD COLUMN arrival_port VARCHAR(255);

-- Add an index on type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trip_packages_type ON trip_packages(type);

-- Update existing rows to have 'package' type (they are currently all packages)
UPDATE trip_packages SET type = 'package' WHERE type IS NULL;