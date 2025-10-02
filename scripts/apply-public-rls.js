const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  console.log('📋 Applying public access RLS policies...\n');

  const sqlFile = path.join(__dirname, '../database/migrations/fix_public_access_rls.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  // Split by statement and execute each one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      console.log(`Executing: ${statement.substring(0, 60)}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement
      });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_sql')
          .select('*')
          .limit(0);

        console.log('⚠️  Note: Cannot execute via RPC, will provide SQL for manual execution');
        break;
      }

      console.log('✅ Success\n');
    } catch (err) {
      console.error('❌ Error:', err.message);
    }
  }

  console.log('\n📝 Manual SQL execution required:');
  console.log('\nRun this command in your terminal:\n');
  console.log('PGPASSWORD=postgres psql -h db.sgcxjlpcqsbiusugslnf.supabase.co -U postgres -d postgres -f database/migrations/fix_public_access_rls.sql');
  console.log('\nOr execute this SQL in Supabase SQL Editor:\n');
  console.log(sql);
}

applyMigration().catch(console.error);
