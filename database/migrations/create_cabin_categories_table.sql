-- Create cabin_categories table for detailed cabin information
CREATE TABLE IF NOT EXISTS cabin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Foreign key to ship
    ship_id UUID NOT NULL REFERENCES ships(id) ON DELETE CASCADE,

    -- Cabin details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pricing_per_person DECIMAL(10,2),

    -- Images
    images TEXT[], -- Array of image URLs for this cabin category

    -- Additional metadata
    quantity VARCHAR(100), -- e.g., "four", "six", etc.
    size_sqm DECIMAL(8,2), -- Size in square meters
    max_occupancy INTEGER,
    amenities TEXT[], -- Array of amenities specific to this cabin

    -- Unique constraint: one entry per ship-cabin name combination
    UNIQUE(ship_id, name)
);

-- Add RLS policies
ALTER TABLE cabin_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read cabin categories
CREATE POLICY "Anyone can view cabin categories" ON cabin_categories
    FOR SELECT USING (true);

-- Policy: Only authenticated users can manage cabin categories (admin functionality)
CREATE POLICY "Authenticated users can manage cabin categories" ON cabin_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE TRIGGER update_cabin_categories_updated_at BEFORE UPDATE ON cabin_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster ship lookups
CREATE INDEX idx_cabin_categories_ship_id ON cabin_categories(ship_id);

COMMENT ON TABLE cabin_categories IS 'Detailed information about cabin categories for each ship';
COMMENT ON COLUMN cabin_categories.pricing_per_person IS 'Price per person for this cabin category';
COMMENT ON COLUMN cabin_categories.images IS 'Array of image URLs for this specific cabin category';
