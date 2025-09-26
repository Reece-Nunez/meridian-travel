const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey)
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Starting cruise integration migration...')

  try {
    // Add type column
    console.log('Adding type column...')
    const { error: typeError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'package' CHECK (type IN ('package', 'cruise'));`
    })
    if (typeError) {
      // If rpc doesn't exist, try using raw SQL
      console.log('Trying alternative approach for type column...')
      const { error: altError } = await supabase
        .from('trip_packages')
        .select('type')
        .limit(1)

      if (altError && altError.message.includes('column "type" does not exist')) {
        console.log('Type column needs to be added manually through Supabase dashboard')
        console.log('Please run the following SQL in your Supabase SQL editor:')
        console.log(`
-- Add type column to distinguish between packages and cruises
ALTER TABLE trip_packages
ADD COLUMN type VARCHAR(10) DEFAULT 'package' CHECK (type IN ('package', 'cruise'));

-- Add cruise-specific fields (optional columns)
ALTER TABLE trip_packages
ADD COLUMN ship_name VARCHAR(255),
ADD COLUMN cruise_line VARCHAR(255),
ADD COLUMN cabin_category VARCHAR(100),
ADD COLUMN departure_port VARCHAR(255),
ADD COLUMN arrival_port VARCHAR(255);

-- Add an index on type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trip_packages_type ON trip_packages(type);

-- Update existing rows to have 'package' type
UPDATE trip_packages SET type = 'package' WHERE type IS NULL;
        `)
        process.exit(1)
      }
    }

    console.log('Migration completed successfully!')

  } catch (error) {
    console.error('Migration failed:', error.message)
    console.log('Please run the migration manually in Supabase SQL editor:')
    console.log(`
-- Add cruise integration columns to trip_packages table
ALTER TABLE trip_packages
ADD COLUMN IF NOT EXISTS type VARCHAR(10) DEFAULT 'package' CHECK (type IN ('package', 'cruise')),
ADD COLUMN IF NOT EXISTS ship_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS cruise_line VARCHAR(255),
ADD COLUMN IF NOT EXISTS cabin_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS departure_port VARCHAR(255),
ADD COLUMN IF NOT EXISTS arrival_port VARCHAR(255);

-- Add an index on type for efficient filtering
CREATE INDEX IF NOT EXISTS idx_trip_packages_type ON trip_packages(type);

-- Update existing rows to have 'package' type
UPDATE trip_packages SET type = 'package' WHERE type IS NULL;
    `)
    process.exit(1)
  }
}

runMigration()