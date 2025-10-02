import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhoguzivqhhdvljfhvwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2d1eml2cWhoZHZsamZodndaIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTA3MDY2NSwiZXhwIjoyMDQ2NjQ2NjY1fQ.nRJyNfqRiO_iBRaBh1k8mJn6uaEzpLM4FQ5fJ7zd-fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteFlow() {
  console.log('🚢 Testing complete boat and package management flow...\n');

  try {
    // Step 1: Create a test ship
    console.log('1. Creating test ship...');
    const { data: ship, error: shipError } = await supabase
      .from('ships')
      .insert({
        name: 'MV Explorer Dream',
        cruise_line: 'Expedition Cruises',
        description: 'A luxury expedition vessel designed for exploring remote destinations with comfort and style.',
        capacity: 48,
        ship_type: 'Luxury Expedition',
        length_meters: 72.5,
        beam_meters: 11.8,
        year_built: 2018,
        operating_regions: ['Galapagos', 'Antarctica'],
        base_port: 'Baltra Island, Galapagos',
        cabin_categories: ['Presidential Suite', 'Junior Suite', 'Deluxe Cabin'],
        ship_features: ['All-suite accommodations', 'Fine dining restaurant', 'Observation deck', 'Zodiac fleet', 'Spa & wellness center'],
        luxury_highlights: ['Butler service', 'Private balconies', 'Gourmet cuisine', 'Expert naturalist guides'],
        images: ['/ships/explorer-dream-1.jpg', '/ships/explorer-dream-2.jpg'],
        is_active: true,
        is_featured: true
      })
      .select()
      .single();

    if (shipError) {
      console.error('❌ Failed to create ship:', shipError);
      return;
    }

    console.log('✅ Ship created successfully:', ship.name);
    console.log('   Ship ID:', ship.id);
    console.log('   Capacity:', ship.capacity);
    console.log('   Type:', ship.ship_type);

    // Step 2: Create test cruise packages using the ship
    console.log('\n2. Creating test cruise packages...');

    const packages = [
      {
        title: 'Galapagos Wildlife Discovery - 7 Days',
        description: 'Explore the unique wildlife of the Galapagos Islands aboard our luxury expedition vessel.',
        destination: 'Galapagos Islands, Ecuador',
        duration: 7,
        max_participants: ship.capacity,
        type: 'cruise',
        ship_id: ship.id,
        ship_name: ship.name, // Keep for backward compatibility
        luxury_highlights: ['Daily guided excursions', 'Snorkeling equipment included', 'Naturalist presentations', 'Zodiac landings'],
        images: ['/packages/galapagos-wildlife-1.jpg'],
        is_active: true
      },
      {
        title: 'Galapagos Photography Expedition - 10 Days',
        description: 'A specialized photography-focused expedition through the Galapagos archipelago.',
        destination: 'Galapagos Islands, Ecuador',
        duration: 10,
        max_participants: ship.capacity,
        type: 'cruise',
        ship_id: ship.id,
        ship_name: ship.name,
        luxury_highlights: ['Professional photography guide', 'Underwater photography sessions', 'Evening photo reviews', 'Equipment available'],
        images: ['/packages/galapagos-photo-1.jpg'],
        is_active: true
      }
    ];

    for (const pkg of packages) {
      const { data: packageData, error: packageError } = await supabase
        .from('trip_packages')
        .insert(pkg)
        .select()
        .single();

      if (packageError) {
        console.error('❌ Failed to create package:', pkg.title, packageError);
      } else {
        console.log('✅ Package created:', packageData.title);
        console.log('   Package ID:', packageData.id);
        console.log('   Ship ID:', packageData.ship_id);
      }
    }

    // Step 3: Test the data retrieval as the cruise page would
    console.log('\n3. Testing cruise data retrieval...');

    const { data: packagesWithShips, error: fetchError } = await supabase
      .from('trip_packages')
      .select(`
        *,
        ship:ships(*)
      `)
      .eq('type', 'cruise')
      .eq('is_active', true)
      .not('ship_id', 'is', null)
      .order('ship_id', { ascending: true });

    if (fetchError) {
      console.error('❌ Failed to fetch cruise data:', fetchError);
      return;
    }

    console.log('✅ Successfully retrieved cruise data');
    console.log('   Found', packagesWithShips.length, 'cruise packages with ship data');

    packagesWithShips.forEach(pkg => {
      console.log(`   - ${pkg.title} (${pkg.duration} days) on ${pkg.ship.name}`);
    });

    // Step 4: Test ship management endpoints
    console.log('\n4. Testing ship data query...');

    const { data: ships, error: shipsError } = await supabase
      .from('ships')
      .select('*')
      .eq('is_active', true);

    if (shipsError) {
      console.error('❌ Failed to fetch ships:', shipsError);
      return;
    }

    console.log('✅ Successfully retrieved ships data');
    console.log('   Found', ships.length, 'active ships');

    ships.forEach(ship => {
      console.log(`   - ${ship.name} (${ship.capacity} guests, ${ship.ship_type})`);
    });

    console.log('\n🎉 Complete flow test successful!');
    console.log('\n📋 Summary:');
    console.log(`   • Ships table: Working ✅`);
    console.log(`   • Ship creation: Working ✅`);
    console.log(`   • Package-ship relationship: Working ✅`);
    console.log(`   • JOIN queries: Working ✅`);
    console.log(`   • Data retrieval: Working ✅`);

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testCompleteFlow();