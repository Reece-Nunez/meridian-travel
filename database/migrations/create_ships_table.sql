-- Create ships table
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    -- Basic ship information
    name VARCHAR(255) NOT NULL UNIQUE,
    cruise_line VARCHAR(255),
    description TEXT,

    -- Ship specifications
    capacity INTEGER NOT NULL DEFAULT 50,
    ship_type VARCHAR(100) NOT NULL DEFAULT 'Expedition vessel', -- 'Luxury yacht', 'Expedition vessel', 'Cruise ship'
    length_meters DECIMAL(8,2),
    beam_meters DECIMAL(8,2),
    year_built INTEGER,

    -- Operating details
    operating_regions TEXT[], -- ['Antarctica', 'Galapagos', 'Amazon', 'Chile']
    base_port VARCHAR(255),

    -- Features and amenities
    cabin_categories TEXT[], -- ['Suite', 'Deluxe', 'Standard']
    ship_features TEXT[], -- ['All-suite accommodations', 'Fine dining', 'Spa', 'Observation deck']
    luxury_highlights TEXT[], -- Similar to packages but ship-specific

    -- Media
    images TEXT[], -- Array of image URLs
    deck_plans TEXT[], -- Array of deck plan image URLs

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Add RLS policies
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active ships
CREATE POLICY "Anyone can view active ships" ON ships
    FOR SELECT USING (is_active = true);

-- Policy: Only authenticated users can manage ships (admin functionality)
CREATE POLICY "Authenticated users can manage ships" ON ships
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ships_updated_at BEFORE UPDATE ON ships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add ship_id foreign key to trip_packages table
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS ship_id UUID REFERENCES ships(id) ON DELETE SET NULL;