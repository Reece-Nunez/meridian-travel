const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCruisePackages() {
  console.log('Checking cruise packages in database...');

  try {
    const { data: packages, error } = await supabase
      .from('trip_packages')
      .select('id, title, ship_name, destination, duration, description, luxury_highlights, is_active')
      .eq('type', 'cruise')
      .eq('is_active', true)
      .order('ship_name', { ascending: true });

    if (error) {
      console.error('Error fetching cruise packages:', error);
      return;
    }

    if (packages && packages.length > 0) {
      console.log(`✅ Found ${packages.length} active cruise packages:`);
      packages.forEach((pkg, index) => {
        console.log(`\n${index + 1}. ${pkg.title}`);
        console.log(`   Ship: ${pkg.ship_name || 'Not specified'}`);
        console.log(`   Destination: ${pkg.destination}`);
        console.log(`   Duration: ${pkg.duration} days`);
        console.log(`   Description: ${pkg.description ? pkg.description.substring(0, 100) + '...' : 'None'}`);
        console.log(`   Highlights: ${pkg.luxury_highlights ? pkg.luxury_highlights.length + ' items' : 'None'}`);
      });
    } else {
      console.log('❌ No active cruise packages found in database');
      console.log('\nTo test the integration, you need to:');
      console.log('1. Go to /admin/packages/new');
      console.log('2. Create a cruise package with type "cruise"');
      console.log('3. Set is_active to true');
      console.log('4. Refresh the cruises page to see the integration');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkCruisePackages();