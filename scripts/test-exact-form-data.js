const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testExactFormData() {
  console.log('Testing with exact form data structure...\n');

  // Simulate what the form sends when creating an Ecuador package (WITH FIX)
  const packageData = {
    title: 'TEST Ecuador Adventure - 10 Days',
    description: 'Experience the beauty of Ecuador with this comprehensive tour',
    destination: 'Ecuador',
    duration: 10,
    max_participants: 12,
    is_active: true,
    includes: ['All accommodations', 'Professional guide', 'Meals as specified'],
    excludes: ['International flights', 'Travel insurance'],
    luxury_highlights: ['Boutique hotels', 'Small group experience'],
    images: [],
    type: 'package',
    ship_id: null,  // FIXED: was '' (empty string), now null
    ship_name: null,  // FIXED: was '' (empty string), now null
    cabin_category: null,  // FIXED: was '' (empty string), now null
    price_usd: null,
    price_eur: null,
    price_gbp: null,
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Quito',
        activities: [
          {
            name: 'Airport transfer',
            description: 'Transfer to your hotel in Quito'
          }
        ],
        accommodation: 'Boutique Hotel Quito',
        images: []
      }
    ]
  };

  console.log('Attempting to insert package with this data:');
  console.log(JSON.stringify(packageData, null, 2));
  console.log('\n');

  const { data, error } = await supabase
    .from('trip_packages')
    .insert([packageData])
    .select();

  if (error) {
    console.error('❌ INSERT FAILED');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('\nFull error object:');
    console.error(JSON.stringify(error, null, 2));
  } else {
    console.log('✅ INSERT SUCCESSFUL!');
    console.log('Created package:', data[0]);

    // Clean up
    await supabase.from('trip_packages').delete().eq('id', data[0].id);
    console.log('✅ Test data cleaned up');
  }
}

testExactFormData();
