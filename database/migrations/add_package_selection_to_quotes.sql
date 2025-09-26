-- Add package/cruise selection columns to custom_quotes table
-- This enables tracking which package or cruise was selected for the quote

-- Add package_type column to track the type of request
ALTER TABLE custom_quotes
ADD COLUMN IF NOT EXISTS package_type VARCHAR(10) DEFAULT 'custom' CHECK (package_type IN ('custom', 'package', 'cruise'));

-- Add selected_package_id column to reference the selected package/cruise
ALTER TABLE custom_quotes
ADD COLUMN IF NOT EXISTS selected_package_id UUID REFERENCES trip_packages(id) ON DELETE SET NULL;

-- Add an index for efficient filtering by package type
CREATE INDEX IF NOT EXISTS idx_custom_quotes_package_type ON custom_quotes(package_type);

-- Add an index for efficient lookups by selected package
CREATE INDEX IF NOT EXISTS idx_custom_quotes_selected_package ON custom_quotes(selected_package_id) WHERE selected_package_id IS NOT NULL;

-- Update existing rows to have 'custom' package type
UPDATE custom_quotes SET package_type = 'custom' WHERE package_type IS NULL;