const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  const migrationPath = path.join(__dirname, '..', 'database', 'migrations', filename);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Split by semicolons and filter out empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`   Found ${statements.length} SQL statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`   [${i + 1}/${statements.length}] Executing...`);

    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        console.error(`   ❌ Error:`, error.message);
        // Continue with other statements
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.error(`   ❌ Exception:`, err.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');

  try {
    // Run migrations in order
    await runMigration('add_user_roles.sql');
    await runMigration('create_missing_profiles.sql');

    console.log('\n✅ All migrations completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Sign out and sign back in as reece@nunezdev.com');
    console.log('   2. You should be redirected to /admin');
    console.log('   3. Check console for: isAdmin: true role: admin');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
