const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testCruisePackages = [
  {
    title: 'Antarctica Explorer - 10 Days',
    ship_name: 'Ocean Explorer',
    destination: 'Antarctica',
    duration: 10,
    max_participants: 50,
    description: 'Experience the pristine wilderness of Antarctica aboard our luxury expedition vessel. Witness massive icebergs, penguin colonies, and dramatic landscapes in the world\'s last frontier.',
    luxury_highlights: [
      'Daily zodiac excursions to ice formations and wildlife sites',
      'Expert naturalist guides and marine biologists',
      'All-suite accommodations with private balconies',
      'Fine dining with locally-sourced ingredients',
      'Heated indoor observation decks',
      'Professional photography workshops'
    ],
    type: 'cruise',
    is_active: true,
    images: ['/antarctica-ship.jpg']
  },
  {
    title: 'Antarctica Peninsula Adventure - 8 Days',
    ship_name: 'Ocean Explorer',
    destination: 'Antarctica',
    duration: 8,
    max_participants: 50,
    description: 'A shorter but equally spectacular journey to the Antarctic Peninsula, perfect for first-time Antarctic explorers.',
    luxury_highlights: [
      'Zodiac landings at penguin rookeries',
      'Visit to historic research stations',
      'Whale watching opportunities',
      'Professional expedition team',
      'All-inclusive luxury amenities'
    ],
    type: 'cruise',
    is_active: true,
    images: ['/antarctica-ship.jpg']
  },
  {
    title: 'Amazon River Discovery',
    ship_name: 'Amazon Discoverer',
    destination: 'Amazon',
    duration: 5,
    max_participants: 24,
    description: 'Navigate deep into the Amazon rainforest aboard our intimate luxury vessel, discovering incredible wildlife and indigenous cultures.',
    luxury_highlights: [
      'Small group expeditions to remote tributaries',
      'Night safaris for nocturnal wildlife',
      'Cultural visits to local communities',
      'Expert naturalist and cultural guides',
      'Panoramic windows in all suites',
      'Canopy-level observation deck'
    ],
    type: 'cruise',
    is_active: true,
    images: ['/amazon-ship.jpg']
  },
  {
    title: 'Chilean Fjords Expedition',
    ship_name: 'Patagonia Star',
    destination: 'Chile',
    duration: 7,
    max_participants: 100,
    description: 'Explore the dramatic fjords and glaciers of Chilean Patagonia, sailing through some of the world\'s most spectacular scenery.',
    luxury_highlights: [
      'Glacier viewing from heated observation lounges',
      'Kayaking in protected fjords',
      'Visit to Cape Horn weather permitting',
      'Gourmet dining featuring local specialties',
      'Spa and wellness facilities',
      'Expert expedition team and lectures'
    ],
    type: 'cruise',
    is_active: true,
    images: ['/chile-ship.jpg']
  }
];

async function createTestCruisePackages() {
  console.log('Creating test cruise packages...\n');

  try {
    for (const packageData of testCruisePackages) {
      console.log(`Creating: ${packageData.title}`);

      const { data, error } = await supabase
        .from('trip_packages')
        .insert([packageData])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating ${packageData.title}:`, error);
      } else {
        console.log(`✅ Created: ${data.title} (ID: ${data.id})`);
      }
    }

    console.log('\n🎉 Test cruise packages created successfully!');
    console.log('\nNow you can:');
    console.log('1. Visit http://localhost:3001/cruises');
    console.log('2. See boats organized by location (Antarctica, Amazon, Chile, Galapagos)');
    console.log('3. Test multiple itineraries per boat (Ocean Explorer has 2 Antarctica trips)');
    console.log('4. Verify that descriptions and highlights appear in the modal');
    console.log('5. Test the quote request flow with real package IDs');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

createTestCruisePackages();