/**
 * Browser-side Supabase client (Singleton)
 * This client should be used in Client Components
 */
import { createClient as createSupabaseJs } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use global to persist singleton across hot module reloading in development
const globalForSupabase = typeof globalThis !== 'undefined' ? globalThis as typeof globalThis & {
  supabaseClient?: SupabaseClient;
} : undefined;

export function createClient(): SupabaseClient {
  // Return existing client if already created (singleton pattern)
  if (globalForSupabase?.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Use the standard createClient to ensure consistent auth behavior
  // across all client-side imports
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
