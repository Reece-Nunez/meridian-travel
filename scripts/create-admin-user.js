const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This key can create users directly
);

async function createAdminUser() {
  console.log('Creating admin user...');

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'chris@meridianluxury.travel',
      password: 'MeridianAdmin2024!',
      email_confirm: true // Skip email verification
    });

    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email:', data.user.email);
    console.log('ID:', data.user.id);
    console.log('\nYou can now login with:');
    console.log('Email: chris@meridianluxury.travel');
    console.log('Password: MeridianAdmin2024!');

  } catch (error) {
    console.error('Script error:', error);
  }
}

createAdminUser();