const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function createTestCruise() {
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

  console.log('Creating test cruise package...')

  try {
    const { data, error } = await supabase
      .from('trip_packages')
      .insert([
        {
          title: 'Antarctic Discovery Cruise',
          description: 'Explore the pristine wilderness of Antarctica aboard our luxury expedition vessel. Experience close encounters with penguins, seals, and whales while enjoying world-class service and comfortable accommodations.',
          destination: 'Antarctica',
          duration: 11,
          type: 'cruise',
          cruise_line: 'Celebrity Cruises',
          ship_name: 'Celebrity Eclipse',
          cabin_category: 'Balcony',
          departure_port: 'Buenos Aires, Argentina',
          arrival_port: 'Valparaíso, Chile',
          max_participants: 100,
          includes: [
            'All meals and beverages (excluding premium spirits)',
            'Professional naturalist guide',
            'Zodiac landing excursions',
            'Educational lectures and presentations',
            'Photography workshops',
            'Onboard entertainment and activities',
            'Port charges and taxes'
          ],
          excludes: [
            'International flights to/from embarkation ports',
            'Pre and post cruise accommodations',
            'Travel insurance',
            'Premium alcoholic beverages',
            'Spa treatments and specialty dining',
            'Personal expenses and gratuities'
          ],
          luxury_highlights: [
            'Expert expedition guides with decades of polar experience',
            'State-of-the-art expedition vessel with ice-class rating',
            'Luxury suite accommodations with private balconies',
            'World-class dining featuring local and international cuisine',
            'Comprehensive educational program with expert naturalists',
            'Professional photography instruction and equipment',
            'Exclusive small-group landings for intimate wildlife encounters'
          ],
          images: [
            '/antarctica-cruise-1.jpg',
            '/antarctica-penguins.jpg',
            '/antarctica-iceberg.jpg'
          ],
          is_active: true
        }
      ])
      .select()

    if (error) {
      console.error('Error creating test cruise:', error)
    } else {
      console.log('Test cruise created successfully:', data[0])
      console.log('✅ Antarctic Discovery Cruise is now available in the quote form')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestCruise()