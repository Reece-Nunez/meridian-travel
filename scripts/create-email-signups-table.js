const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmailSignupsTable() {
  try {
    console.log('Creating email_signups table...');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/migrations/create_email_signups.sql'),
      'utf8'
    );

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      // Try direct execution if RPC doesn't exist
      console.log('Trying direct table creation...');
      
      const { error: createError } = await supabase.from('email_signups').select('*').limit(1);
      
      if (createError && createError.message.includes('relation "email_signups" does not exist')) {
        console.log('\n⚠️  Table does not exist. Please run this SQL in your Supabase dashboard:');
        console.log('\n' + migrationSQL);
        console.log('\n📍 Go to: Supabase Dashboard > SQL Editor > New Query\n');
      } else {
        console.log('✅ Table already exists or created successfully');
      }
    } else {
      console.log('✅ Email signups table created successfully!');
    }

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\n⚠️  Please run the migration SQL manually in Supabase Dashboard');
  }
}

createEmailSignupsTable();
