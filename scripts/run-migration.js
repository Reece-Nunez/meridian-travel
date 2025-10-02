import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://vhoguzivqhhdvljfhvwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob2d1eml2cWhoZHZsamZodndaIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTA3MDY2NSwiZXhwIjoyMDQ2NjQ2NjY1fQ.nRJyNfqRiO_iBRaBh1k8mJn6uaEzpLM4FQ5fJ7zd-fI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', 'create_ships_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running ships table migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Migration failed:', error);
    } else {
      console.log('Migration completed successfully!');
    }
  } catch (err) {
    console.error('Error reading migration file:', err);
  }
}

runMigration();