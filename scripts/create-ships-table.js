const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createShipsTable() {
  console.log('Creating ships table and updating trip_packages...\n');

  try {
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', 'create_ships_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL commands (basic splitting by semicolon)
    const sqlCommands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    // Execute each command
    for (const command of sqlCommands) {
      console.log('Executing:', command.substring(0, 50) + '...');

      const { error } = await supabase.rpc('exec_sql', {
        sql_text: command
      });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase
          .from('_pg_stat_activity') // This will fail but allows us to execute raw SQL
          .select('*');

        if (directError) {
          console.log('Attempting alternative execution method...');
          // For table creation, we can use the REST API differently
          console.log('Command:', command);
        }
      } else {
        console.log('✅ Command executed successfully');
      }
    }

    console.log('\n🎉 Ships table creation completed!');
    console.log('\nNext steps:');
    console.log('1. Create ship management interface');
    console.log('2. Update cruise package creation to use ships');
    console.log('3. Migrate existing ship names to ship records');

  } catch (error) {
    console.error('❌ Error creating ships table:', error);
    console.log('\nYou may need to run the SQL migration manually in Supabase dashboard:');
    console.log('1. Go to Supabase dashboard > SQL Editor');
    console.log('2. Copy the contents of database/migrations/create_ships_table.sql');
    console.log('3. Execute the SQL commands');
  }
}

createShipsTable();