const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPricingFields() {
  console.log('Adding pricing fields to trip_packages table...\n');

  try {
    // Run the migration using Supabase SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$
        BEGIN
            -- Add price_usd if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'trip_packages' AND column_name = 'price_usd'
            ) THEN
                ALTER TABLE trip_packages ADD COLUMN price_usd DECIMAL(10,2);
                RAISE NOTICE 'Added price_usd column';
            END IF;

            -- Add price_eur if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'trip_packages' AND column_name = 'price_eur'
            ) THEN
                ALTER TABLE trip_packages ADD COLUMN price_eur DECIMAL(10,2);
                RAISE NOTICE 'Added price_eur column';
            END IF;

            -- Add price_gbp if it doesn't exist
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'trip_packages' AND column_name = 'price_gbp'
            ) THEN
                ALTER TABLE trip_packages ADD COLUMN price_gbp DECIMAL(10,2);
                RAISE NOTICE 'Added price_gbp column';
            END IF;
        END $$;
      `
    });

    if (error) {
      console.log('Note: The exec_sql RPC function may not exist. Checking if columns exist via direct query...\n');

      // Try to check columns directly
      const { data: columns, error: colError } = await supabase
        .from('trip_packages')
        .select('price_usd, price_eur, price_gbp')
        .limit(1);

      if (colError) {
        console.log('❌ Pricing columns do not exist yet.');
        console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
        console.log('-------------------------------------------------------');
        console.log(`
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS price_usd DECIMAL(10,2);
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS price_eur DECIMAL(10,2);
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS price_gbp DECIMAL(10,2);
        `);
        console.log('-------------------------------------------------------\n');
      } else {
        console.log('✅ Pricing columns already exist!');
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

addPricingFields();
