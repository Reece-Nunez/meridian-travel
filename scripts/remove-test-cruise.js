const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function removeTestCruise() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('Removing test cruise package...')

  try {
    // Find and delete the test cruise
    const { data, error } = await supabase
      .from('trip_packages')
      .delete()
      .eq('title', 'Antarctic Discovery Cruise')
      .eq('type', 'cruise')
      .select()

    if (error) {
      console.error('Error removing test cruise:', error)
    } else if (data && data.length > 0) {
      console.log('Test cruise removed successfully:', data[0].title)
      console.log('✅ Antarctic Discovery Cruise has been deleted from the database')
    } else {
      console.log('No test cruise found to remove (may have already been deleted)')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

removeTestCruise()