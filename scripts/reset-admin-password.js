const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAdminPassword() {
  console.log('Resetting admin password...');

  try {
    // Get user by email first
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error fetching users:', listError);
      return;
    }

    const adminUser = users.users.find(user => user.email === 'chris@meridianluxury.travel');

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    // Update password
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: 'MeridianAdmin2024!' }
    );

    if (error) {
      console.error('Error updating password:', error);
      return;
    }

    console.log('✅ Admin password reset successfully!');
    console.log('\nYou can now login with:');
    console.log('Email: chris@meridianluxury.travel');
    console.log('Password: MeridianAdmin2024!');

  } catch (error) {
    console.error('Script error:', error);
  }
}

resetAdminPassword();