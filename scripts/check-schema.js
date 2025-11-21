const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('Testing Ecuador land package creation...\n');

  // Test 1: Basic insert with minimal fields
  console.log('Test 1: Minimal package (no pricing)');
  console.log('====================================');
  const { data: test1, error: error1 } = await supabase
    .from('trip_packages')
    .insert([{
      title: 'TEST Ecuador Package - DELETE ME',
      description: 'Test package',
      destination: 'Ecuador',
      duration: 7,
      type: 'package',
      is_active: false,
      max_participants: 12,
      includes: ['Test'],
      excludes: ['Test'],
      luxury_highlights: []
    }])
    .select();

  if (error1) {
    console.error('❌ Test 1 FAILED:', error1.message);
    console.error('Error details:', JSON.stringify(error1, null, 2));
  } else {
    console.log('✅ Test 1 PASSED!');
    if (test1 && test1[0]) {
      await supabase.from('trip_packages').delete().eq('id', test1[0].id);
      console.log('✅ Test data cleaned up\n');
    }
  }

  // Test 2: Package with null pricing (like the form sends)
  console.log('Test 2: Package with null pricing');
  console.log('====================================');
  const { data: test2, error: error2 } = await supabase
    .from('trip_packages')
    .insert([{
      title: 'TEST Ecuador Package 2 - DELETE ME',
      description: 'Test package with null pricing',
      destination: 'Ecuador',
      duration: 7,
      type: 'package',
      is_active: false,
      max_participants: 12,
      includes: ['Test'],
      excludes: ['Test'],
      luxury_highlights: [],
      price_usd: null,
      price_eur: null,
      price_gbp: null
    }])
    .select();

  if (error2) {
    console.error('❌ Test 2 FAILED:', error2.message);
    console.error('Error details:', JSON.stringify(error2, null, 2));
  } else {
    console.log('✅ Test 2 PASSED!');
    if (test2 && test2[0]) {
      await supabase.from('trip_packages').delete().eq('id', test2[0].id);
      console.log('✅ Test data cleaned up\n');
    }
  }

  // Test 3: Package with text pricing (as it should be based on migrations)
  console.log('Test 3: Package with text pricing');
  console.log('====================================');
  const { data: test3, error: error3 } = await supabase
    .from('trip_packages')
    .insert([{
      title: 'TEST Ecuador Package 3 - DELETE ME',
      description: 'Test package with text pricing',
      destination: 'Ecuador',
      duration: 7,
      type: 'package',
      is_active: false,
      max_participants: 12,
      includes: ['Test'],
      excludes: ['Test'],
      luxury_highlights: [],
      price_usd: 'Starting at $1000',
      price_eur: 'From €900 per person',
      price_gbp: 'Starting at £800'
    }])
    .select();

  if (error3) {
    console.error('❌ Test 3 FAILED:', error3.message);
    console.error('Error details:', JSON.stringify(error3, null, 2));
  } else {
    console.log('✅ Test 3 PASSED!');
    if (test3 && test3[0]) {
      await supabase.from('trip_packages').delete().eq('id', test3[0].id);
      console.log('✅ Test data cleaned up\n');
    }
  }

  console.log('\n=== Summary ===');
  console.log('If all tests passed, the database schema is correct.');
  console.log('If any test failed, check the error details above.');
}

checkSchema();
