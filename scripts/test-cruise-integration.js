const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCruiseIntegration() {
  console.log('Testing cruise integration data flow...\n');

  try {
    // Step 1: Fetch cruise packages (same as frontend does)
    console.log('1. Fetching cruise packages from database...');
    const { data: packages, error } = await supabase
      .from('trip_packages')
      .select('*')
      .eq('type', 'cruise')
      .eq('is_active', true)
      .order('ship_name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching packages:', error);
      return;
    }

    console.log(`✅ Found ${packages.length} packages`);

    // Step 2: Process packages into boats (same logic as frontend)
    console.log('\n2. Processing packages into boat structure...');

    const mapDestinationToLocation = (destination) => {
      const locationMap = {
        'galapagos': 'Galapagos',
        'antarctica': 'Antarctica',
        'patagonia': 'Chile',
        'chile': 'Chile',
        'amazon': 'Amazon'
      };
      return locationMap[destination?.toLowerCase()] || destination || 'Unknown';
    };

    const determineBoatType = (pkg) => {
      const capacity = pkg.max_participants || 50;
      if (capacity <= 20) return 'Luxury yacht';
      if (capacity <= 100) return 'Expedition vessel';
      return 'Cruise ship';
    };

    const calculateBasePrice = (duration, location) => {
      const basePrices = {
        'Antarctica': 1000,
        'Chile': 400,
        'Galapagos': 500,
        'Amazon': 350
      };
      const baseRate = basePrices[location] || 400;
      return duration * baseRate;
    };

    const boatsMap = new Map();

    packages.forEach((pkg) => {
      const shipName = pkg.ship_name || pkg.title;
      const location = mapDestinationToLocation(pkg.destination);

      if (!boatsMap.has(shipName)) {
        boatsMap.set(shipName, {
          id: shipName,
          name: shipName,
          location: location,
          capacity: pkg.max_participants || 50,
          itineraryCount: 0,
          image: pkg.images && pkg.images[0] ? pkg.images[0] : '/cruise-default.jpg',
          startingPrice: 0,
          boatType: determineBoatType(pkg),
          features: pkg.luxury_highlights?.slice(0, 3) || ['Professional crew', 'Naturalist guides', 'Premium amenities'],
          itineraries: []
        });
      }

      const boat = boatsMap.get(shipName);

      boat.itineraries.push({
        id: pkg.id,
        name: pkg.title,
        duration: `${pkg.duration} days`,
        price: 0,
        description: pkg.description || undefined,
        highlights: pkg.luxury_highlights || undefined
      });

      boat.itineraryCount = boat.itineraries.length;

      const basePrice = calculateBasePrice(pkg.duration, location);
      if (boat.startingPrice === 0 || basePrice < boat.startingPrice) {
        boat.startingPrice = basePrice;
      }
    });

    const processedBoats = Array.from(boatsMap.values());

    console.log(`✅ Processed into ${processedBoats.length} boats:`);

    processedBoats.forEach((boat, index) => {
      console.log(`\n${index + 1}. ${boat.name}`);
      console.log(`   Location: ${boat.location}`);
      console.log(`   Type: ${boat.boatType}`);
      console.log(`   Capacity: ${boat.capacity} passengers`);
      console.log(`   Starting Price: $${boat.startingPrice.toLocaleString()}`);
      console.log(`   Itineraries: ${boat.itineraryCount}`);

      boat.itineraries.forEach((itinerary, iIndex) => {
        console.log(`     ${iIndex + 1}. ${itinerary.name} (${itinerary.duration})`);
        console.log(`        ID: ${itinerary.id}`);
        if (itinerary.description) {
          console.log(`        Description: ${itinerary.description.substring(0, 60)}...`);
        }
        if (itinerary.highlights) {
          console.log(`        Highlights: ${itinerary.highlights.length} items`);
        }
      });
    });

    // Step 3: Test quote URL generation
    console.log('\n3. Testing quote URL generation...');
    processedBoats.forEach(boat => {
      boat.itineraries.forEach(itinerary => {
        const quoteUrl = `/quote?packageId=${itinerary.id}&boat=${boat.name}&itinerary=${itinerary.name}&location=${boat.location}`;
        console.log(`   Quote URL: ${quoteUrl}`);
      });
    });

    console.log('\n✅ Integration test completed successfully!');
    console.log('\nTo see this in action:');
    console.log('1. Visit http://localhost:3001/cruises');
    console.log('2. You should see the processed boats organized by location');
    console.log('3. Click "View Itineraries" to see the modal with real package data');
    console.log('4. Click "Request Quote" to test the quote flow with package IDs');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
}

testCruiseIntegration();