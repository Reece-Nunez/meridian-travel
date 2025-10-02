// Simple test data creation using web API
async function createTestData() {
  console.log('🚢 Creating test ship and cruise package...\n');

  try {
    // Test ship data
    const shipData = {
      name: 'MV Galapagos Explorer',
      cruise_line: 'Celebrity Cruises',
      description: 'A luxury expedition vessel designed for exploring the Galapagos Islands.',
      capacity: 48,
      ship_type: 'Luxury Expedition',
      operating_regions: ['Galapagos'],
      ship_features: ['All-suite accommodations', 'Fine dining', 'Observation deck'],
      luxury_highlights: ['Butler service', 'Private balconies', 'Gourmet cuisine'],
      images: ['/ships/galapagos-explorer.jpg'],
      is_active: true
    };

    console.log('Creating ship via API...');

    // We'll use the browser console to run this or check the database directly
    console.log('Ship data ready:', JSON.stringify(shipData, null, 2));
    console.log('\n✅ Test data preparation complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Use the admin interface to create a ship');
    console.log('2. Create a cruise package that references the ship');
    console.log('3. Test the cruises page to see the integration');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTestData();