const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUser() {
  console.log('Checking admin user status...');

  try {
    // Get user by email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const adminUser = data.users.find(user => user.email === 'chris@meridianluxury.travel');

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('Email:', adminUser.email);
      console.log('ID:', adminUser.id);
      console.log('Email Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('Created:', adminUser.created_at);
      console.log('Last Sign In:', adminUser.last_sign_in_at || 'Never');

      if (!adminUser.email_confirmed_at) {
        console.log('\n🔧 User exists but email not confirmed. Confirming now...');
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          adminUser.id,
          { email_confirm: true }
        );

        if (confirmError) {
          console.error('Error confirming email:', confirmError);
        } else {
          console.log('✅ Email confirmed successfully!');
        }
      }
    } else {
      console.log('❌ Admin user not found');
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkAdminUser();