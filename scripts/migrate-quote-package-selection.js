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

  console.log('Starting quote package selection migration...')

  try {
    console.log('Please run the following SQL in your Supabase SQL editor:')
    console.log(`
-- Add package/cruise selection columns to custom_quotes table
-- Add package_type column to track the type of request
ALTER TABLE custom_quotes
ADD COLUMN IF NOT EXISTS package_type VARCHAR(10) DEFAULT 'custom' CHECK (package_type IN ('custom', 'package', 'cruise'));

-- Add selected_package_id column to reference the selected package/cruise
ALTER TABLE custom_quotes
ADD COLUMN IF NOT EXISTS selected_package_id UUID REFERENCES trip_packages(id) ON DELETE SET NULL;

-- Add an index for efficient filtering by package type
CREATE INDEX IF NOT EXISTS idx_custom_quotes_package_type ON custom_quotes(package_type);

-- Add an index for efficient lookups by selected package
CREATE INDEX IF NOT EXISTS idx_custom_quotes_selected_package ON custom_quotes(selected_package_id) WHERE selected_package_id IS NOT NULL;

-- Update existing rows to have 'custom' package type
UPDATE custom_quotes SET package_type = 'custom' WHERE package_type IS NULL;
    `)

    console.log('Migration SQL provided above. Please execute it in Supabase SQL editor.')
    console.log('This migration adds package/cruise selection tracking to quote requests.')

  } catch (error) {
    console.error('Migration setup failed:', error.message)
    process.exit(1)
  }
}

runMigration()