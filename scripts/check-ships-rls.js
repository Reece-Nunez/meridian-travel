const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies on ships table...\n');

  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual::text as using_clause,
          with_check::text as with_check_clause
        FROM pg_policies
        WHERE tablename = 'ships';
      `
    });

  if (error) {
    // Try alternate method
    const { data: policies, error: err2 } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'ships');

    if (err2) {
      console.error('❌ Error:', err2);
      console.log('\n📋 Checking if RLS is enabled...');

      const { data: tableInfo } = await supabase
        .rpc('exec_sql', {
          query: `
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE tablename = 'ships' AND schemaname = 'public';
          `
        });

      console.log('Table info:', tableInfo);
    } else {
      console.log('Current policies:', policies);
    }
  } else {
    console.log('Current policies:', data);
  }
}

checkRLSPolicies().catch(console.error);
