const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function logTest(name, passed, message = '') {
  if (passed) {
    testResults.passed.push(name);
    console.log(`✅ ${name}`);
  } else {
    testResults.failed.push({ name, message });
    console.log(`❌ ${name}: ${message}`);
  }
}

function logWarning(name, message) {
  testResults.warnings.push({ name, message });
  console.log(`⚠️  ${name}: ${message}`);
}

async function testAdminFunctionality() {
  console.log('\n🧪 Testing Admin Panel Functionality\n');
  console.log('='.repeat(60));

  // Test 1: Database Connection
  console.log('\n📊 DATABASE CONNECTION TESTS\n');
  try {
    const { data, error } = await supabase.from('ships').select('count').limit(1);
    logTest('Database connection', !error, error?.message);
  } catch (err) {
    logTest('Database connection', false, err.message);
  }

  // Test 2: Ships Table
  console.log('\n🚢 SHIPS TABLE TESTS\n');
  try {
    const { data: ships, error } = await supabase.from('ships').select('*');
    logTest('Ships table exists', !error, error?.message);
    logTest('Ships have data', ships && ships.length > 0, `Found ${ships?.length || 0} ships`);

    if (ships && ships.length > 0) {
      const ship = ships[0];
      logTest('Ships have required fields',
        ship.name && ship.capacity && ship.ship_type,
        `Missing: ${!ship.name ? 'name ' : ''}${!ship.capacity ? 'capacity ' : ''}${!ship.ship_type ? 'ship_type' : ''}`
      );

      // Check for new image metadata fields
      if (ship.image_metadata) {
        console.log(`  📸 Ship "${ship.name}" has image metadata with captions`);
      }
      if (ship.deck_plan_metadata) {
        console.log(`  🗺️  Ship "${ship.name}" has deck plan metadata`);
      }
    }
  } catch (err) {
    logTest('Ships table access', false, err.message);
  }

  // Test 3: Trip Packages Table
  console.log('\n📦 TRIP PACKAGES TABLE TESTS\n');
  try {
    const { data: packages, error } = await supabase.from('trip_packages').select('*');
    logTest('Trip packages table exists', !error, error?.message);
    logTest('Trip packages have data', packages && packages.length > 0, `Found ${packages?.length || 0} packages`);

    if (packages && packages.length > 0) {
      const pkg = packages[0];
      logTest('Packages have required fields',
        pkg.title && pkg.destination && pkg.duration,
        `Missing: ${!pkg.title ? 'title ' : ''}${!pkg.destination ? 'destination ' : ''}${!pkg.duration ? 'duration' : ''}`
      );

      // Check for pricing fields
      const hasPricing = pkg.price_usd || pkg.price_eur || pkg.price_gbp;
      if (hasPricing) {
        console.log(`  💰 Package "${pkg.title}" has pricing: USD=$${pkg.price_usd || 'N/A'} EUR=${pkg.price_eur || 'N/A'} GBP=${pkg.price_gbp || 'N/A'}`);
      } else {
        logWarning('Package pricing', `Package "${pkg.title}" has no pricing set`);
      }
    }
  } catch (err) {
    logTest('Trip packages table access', false, err.message);
  }

  // Test 4: Custom Quotes Table
  console.log('\n💬 CUSTOM QUOTES TABLE TESTS\n');
  try {
    const { data: quotes, error } = await supabase.from('custom_quotes').select('*');
    logTest('Custom quotes table exists', !error, error?.message);
    console.log(`  Found ${quotes?.length || 0} quotes`);
  } catch (err) {
    logTest('Custom quotes table access', false, err.message);
  }

  // Test 5: Site Settings Table
  console.log('\n⚙️  SITE SETTINGS TABLE TESTS\n');
  try {
    const { data: settings, error } = await supabase.from('site_settings').select('*');
    logTest('Site settings table exists', !error, error?.message);

    if (settings) {
      const requiredSettings = ['contact_email', 'contact_phone', 'company_name', 'company_address'];
      const foundSettings = settings.map(s => s.setting_key);

      requiredSettings.forEach(key => {
        const found = foundSettings.includes(key);
        if (found) {
          const setting = settings.find(s => s.setting_key === key);
          console.log(`  ✓ ${key}: ${setting.setting_value}`);
        } else {
          logWarning('Required settings', `Missing setting: ${key}`);
        }
      });
    }
  } catch (err) {
    logTest('Site settings table access', false, err.message);
  }

  // Test 6: Content Sections Table
  console.log('\n📝 CONTENT SECTIONS TABLE TESTS\n');
  try {
    const { data: content, error } = await supabase.from('content_sections').select('*');
    logTest('Content sections table exists', !error, error?.message);
    console.log(`  Found ${content?.length || 0} content sections`);
  } catch (err) {
    logTest('Content sections table access', false, err.message);
  }

  // Test 7: RLS Policies - Public Access
  console.log('\n🔒 RLS POLICY TESTS (Public Access)\n');

  // Create an anon client to test public access
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  try {
    const { data, error } = await anonClient.from('ships').select('*').eq('is_active', true);
    logTest('Public can view active ships', !error, error?.message);
    console.log(`  Public can see ${data?.length || 0} active ships`);
  } catch (err) {
    logTest('Public ships access', false, err.message);
  }

  try {
    const { data, error } = await anonClient.from('trip_packages').select('*');
    logTest('Public can view trip packages', !error, error?.message);
  } catch (err) {
    logTest('Public packages access', false, err.message);
  }

  try {
    const { data, error } = await anonClient.from('site_settings').select('*');
    logTest('Public can view site settings', !error, error?.message);
  } catch (err) {
    logTest('Public settings access', false, err.message);
  }

  // Test 8: Check for orphaned packages
  console.log('\n🔗 DATA INTEGRITY TESTS\n');
  try {
    const { data: packages } = await supabase.from('trip_packages').select('ship_id');
    const { data: ships } = await supabase.from('ships').select('id');

    if (packages && ships) {
      const shipIds = new Set(ships.map(s => s.id));
      const orphaned = packages.filter(p => p.ship_id && !shipIds.has(p.ship_id));

      if (orphaned.length > 0) {
        logWarning('Data integrity', `${orphaned.length} packages reference non-existent ships`);
      } else {
        logTest('Package-Ship relationships', true, 'All packages reference valid ships');
      }
    }
  } catch (err) {
    logWarning('Data integrity check', err.message);
  }

  // Test 9: Admin Authentication
  console.log('\n🔐 AUTHENTICATION TESTS\n');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    logTest('Can list users (service role)', !error, error?.message);
    console.log(`  Found ${data?.users?.length || 0} users`);

    // Check for admin user
    const adminUser = data?.users?.find(u => u.email === 'chris@meridianluxury.travel');
    if (adminUser) {
      console.log(`  ✓ Admin user exists: ${adminUser.email}`);
    } else {
      logWarning('Admin user', 'Admin user chris@meridianluxury.travel not found');
    }
  } catch (err) {
    logTest('User listing', false, err.message);
  }

  // Final Report
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:\n');
    testResults.failed.forEach(({ name, message }) => {
      console.log(`  • ${name}: ${message}`);
    });
  }

  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    testResults.warnings.forEach(({ name, message }) => {
      console.log(`  • ${name}: ${message}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  // Exit with error if tests failed
  if (testResults.failed.length > 0) {
    process.exit(1);
  }
}

testAdminFunctionality().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
