/**
 * Browser-side Supabase client (Singleton)
 * Uses cookies for session storage (industry standard for SSR apps)
 * This client should be used in Client Components
 */
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Use global to persist singleton across hot module reloading in development
const globalForSupabase = typeof globalThis !== 'undefined' ? globalThis as typeof globalThis & {
  supabaseClient?: SupabaseClient;
} : undefined;

export function createClient() {
  // Return existing client if already created (singleton pattern)
  if (globalForSupabase?.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey);

  if (globalForSupabase) {
    globalForSupabase.supabaseClient = client;
  }

  return client;
}
