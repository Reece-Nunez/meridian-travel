const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listShips() {
  try {
    console.log('Fetching all ships from database...\n');

    const { data: ships, error: shipsError } = await supabase
      .from('ships')
      .select('id, name, cruise_line, capacity, ship_type, operating_regions, is_active')
      .order('name');

    if (shipsError) throw shipsError;

    if (!ships || ships.length === 0) {
      console.log('❌ No ships found in database');
      return;
    }

    console.log(`✅ Found ${ships.length} ship(s):\n`);

    ships.forEach((ship, index) => {
      console.log(`${index + 1}. ${ship.name}`);
      console.log(`   ID: ${ship.id}`);
      console.log(`   Cruise Line: ${ship.cruise_line || 'N/A'}`);
      console.log(`   Capacity: ${ship.capacity} guests`);
      console.log(`   Type: ${ship.ship_type}`);
      console.log(`   Regions: ${ship.operating_regions ? ship.operating_regions.join(', ') : 'N/A'}`);
      console.log(`   Active: ${ship.is_active ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Check for cruise packages associated with these ships
    console.log('Checking for cruise packages...\n');

    const { data: packages, error: packagesError } = await supabase
      .from('trip_packages')
      .select(`
        id,
        title,
        destination,
        duration,
        ship_id,
        is_active,
        ship:ships(name)
      `)
      .eq('type', 'cruise')
      .order('title');

    if (packagesError) throw packagesError;

    if (!packages || packages.length === 0) {
      console.log('❌ No cruise packages found');
    } else {
      console.log(`✅ Found ${packages.length} cruise package(s):\n`);
      packages.forEach((pkg, index) => {
        console.log(`${index + 1}. ${pkg.title}`);
        console.log(`   Ship: ${pkg.ship?.name || 'Not assigned'}`);
        console.log(`   Destination: ${pkg.destination}`);
        console.log(`   Duration: ${pkg.duration} days`);
        console.log(`   Active: ${pkg.is_active ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

listShips();
