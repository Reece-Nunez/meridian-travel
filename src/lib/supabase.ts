/**
 * Legacy Supabase client export
 * Re-exports the singleton browser client for backward compatibility
 * New code should import from '@/lib/supabase/client' instead
 */
import { createClient as createSupabaseJs } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use the same global reference as @/lib/supabase/client.ts
// This ensures all imports share the same singleton instance
const globalForSupabase = typeof globalThis !== 'undefined' ? globalThis as typeof globalThis & {
  supabaseClient?: SupabaseClient;
} : undefined;

// Get or create the browser singleton client
function getBrowserClient(): SupabaseClient {
  // Return existing client if already created
  if (globalForSupabase?.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing - using dummy client');
    const dummyClient = createSupabaseJs('https://dummy.supabase.co', 'dummy-key');
    if (globalForSupabase) {
      globalForSupabase.supabaseClient = dummyClient;
    }
    return dummyClient;
  }

  const client = createSupabaseJs(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  });

  if (globalForSupabase) {
    globalForSupabase.supabaseClient = client;
  }

  return client;
}

// Create server client (non-singleton since server is stateless)
function getServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing - using dummy client');
    return createSupabaseJs('https://dummy.supabase.co', 'dummy-key');
  }

  return createSupabaseJs(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
}

// Export the appropriate client based on environment
export const supabase: SupabaseClient = typeof window !== 'undefined'
  ? getBrowserClient()
  : getServerClient();

// Server-side admin client
export function createSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('createSupabaseAdmin should only be used on the server side');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase admin environment variables missing - using dummy client');
    return createSupabaseJs('https://dummy.supabase.co', 'dummy-service-key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return createSupabaseJs(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
