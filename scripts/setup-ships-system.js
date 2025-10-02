const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupShipsSystem() {
  console.log('Setting up ships management system...\n');

  console.log('📋 Manual SQL Setup Required:');
  console.log('Please run the following SQL in your Supabase dashboard:\n');

  const sqlCommands = [
    `-- Create ships table
CREATE TABLE IF NOT EXISTS ships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    cruise_line VARCHAR(255),
    description TEXT,
    capacity INTEGER NOT NULL DEFAULT 50,
    ship_type VARCHAR(100) NOT NULL DEFAULT 'Expedition vessel',
    length_meters DECIMAL(8,2),
    beam_meters DECIMAL(8,2),
    year_built INTEGER,
    operating_regions TEXT[],
    base_port VARCHAR(255),
    cabin_categories TEXT[],
    ship_features TEXT[],
    luxury_highlights TEXT[],
    images TEXT[],
    deck_plans TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE
);`,

    `-- Enable RLS
ALTER TABLE ships ENABLE ROW LEVEL SECURITY;`,

    `-- Add policies
CREATE POLICY "Anyone can view active ships" ON ships
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage ships" ON ships
    FOR ALL USING (auth.role() = 'authenticated');`,

    `-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ships_updated_at BEFORE UPDATE ON ships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,

    `-- Add ship_id to trip_packages
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS ship_id UUID REFERENCES ships(id) ON DELETE SET NULL;`
  ];

  sqlCommands.forEach((sql, index) => {
    console.log(`-- Command ${index + 1}:`);
    console.log(sql);
    console.log('');
  });

  console.log('\n🔧 After running the SQL commands, I will create sample ship data...\n');

  // For now, let's create the sample ships data that we'll insert after the table is created
  const sampleShips = [
    {
      name: 'Ocean Explorer',
      cruise_line: 'Expedition Cruises',
      description: 'A state-of-the-art expedition vessel designed for luxury Antarctic and polar exploration. Features all-suite accommodations and world-class amenities.',
      capacity: 50,
      ship_type: 'Expedition vessel',
      length_meters: 104.4,
      beam_meters: 18.0,
      year_built: 2021,
      operating_regions: ['Antarctica'],
      base_port: 'Ushuaia, Argentina',
      cabin_categories: ['Oceanview Suite', 'Veranda Suite', 'Owner Suite'],
      ship_features: [
        'All-suite accommodations with private balconies',
        'Heated indoor observation decks',
        'Fine dining restaurant',
        'Spa and wellness center',
        'Library and lecture hall',
        'Zodiac fleet for landings'
      ],
      luxury_highlights: [
        'Butler service in all suites',
        'Complimentary expedition gear',
        'Expert naturalist guides',
        'Photography workshops',
        'Helicopter excursions (weather permitting)',
        '24-hour room service'
      ],
      images: ['/ships/ocean-explorer-1.jpg', '/ships/ocean-explorer-2.jpg'],
      is_active: true,
      is_featured: true
    },
    {
      name: 'Amazon Discoverer',
      cruise_line: 'River Expeditions',
      description: 'An intimate luxury vessel designed specifically for Amazon River exploration. Small size allows access to remote tributaries while providing premium comfort.',
      capacity: 24,
      ship_type: 'Luxury yacht',
      length_meters: 45.0,
      beam_meters: 8.5,
      year_built: 2020,
      operating_regions: ['Amazon'],
      base_port: 'Iquitos, Peru',
      cabin_categories: ['Panorama Suite', 'Premium Suite'],
      ship_features: [
        'Panoramic windows in all suites',
        'Canopy-level observation deck',
        'Al fresco dining area',
        'Library with regional focus',
        'Small expedition boats',
        'Air conditioning throughout'
      ],
      luxury_highlights: [
        'All-inclusive premium beverages',
        'Expert naturalist and cultural guides',
        'Night safari equipment',
        'Cultural exchange programs',
        'Gourmet Amazonian cuisine',
        'Personalized service'
      ],
      images: ['/ships/amazon-discoverer-1.jpg'],
      is_active: true,
      is_featured: true
    },
    {
      name: 'Patagonia Star',
      cruise_line: 'Chilean Fjords Cruises',
      description: 'A comfortable expedition vessel perfect for exploring the dramatic fjords and glaciers of Chilean Patagonia and Tierra del Fuego.',
      capacity: 100,
      ship_type: 'Expedition vessel',
      length_meters: 89.0,
      beam_meters: 14.5,
      year_built: 2018,
      operating_regions: ['Chile'],
      base_port: 'Punta Arenas, Chile',
      cabin_categories: ['Interior Cabin', 'Oceanview Cabin', 'Suite'],
      ship_features: [
        'Multiple observation decks',
        'Heated indoor lounges',
        'Restaurant with panoramic views',
        'Gift shop and library',
        'Medical center',
        'Zodiac fleet'
      ],
      luxury_highlights: [
        'Glacier viewing from heated lounges',
        'Expert expedition team',
        'Local cultural presentations',
        'Gourmet dining featuring local specialties',
        'Complimentary WiFi',
        'Professional photography guidance'
      ],
      images: ['/ships/patagonia-star-1.jpg'],
      is_active: true,
      is_featured: false
    },
    {
      name: 'test',
      cruise_line: 'Test Cruises',
      description: 'Test ship for Galapagos operations.',
      capacity: 12,
      ship_type: 'Luxury yacht',
      operating_regions: ['Galapagos'],
      base_port: 'Puerto Ayora, Galapagos',
      ship_features: ['Professional crew', 'Naturalist guides', 'Premium amenities'],
      is_active: true,
      is_featured: false
    }
  ];

  console.log('📊 Sample ships data prepared:');
  sampleShips.forEach((ship, index) => {
    console.log(`${index + 1}. ${ship.name} (${ship.ship_type}, ${ship.capacity} passengers) - ${ship.operating_regions.join(', ')}`);
  });

  console.log('\n🚀 Ready to proceed with:');
  console.log('1. Run the SQL commands in Supabase dashboard');
  console.log('2. Create the ship management interface');
  console.log('3. Insert sample ship data');
  console.log('4. Update cruise package creation');

  return sampleShips;
}

setupShipsSystem();