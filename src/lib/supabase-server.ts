/**
 * Server-side Supabase client utilities
 * This file should only be imported in Server Components and API Routes
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a Supabase client for server-side use with cookie support
 * This client can access the user's session from cookies in API routes
 */
export const createSupabaseServerClient = async () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing - using dummy client for build');
    return createClient('https://dummy.supabase.co', 'dummy-key');
  }

  const cookieStore = await cookies();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString()
      }
    }
  });
};
