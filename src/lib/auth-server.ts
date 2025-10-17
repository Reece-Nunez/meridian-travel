/**
 * Server-side authentication utilities
 * This file should ONLY be imported in Server Components and API Routes
 */

import { createSupabaseAdmin } from './supabase';
import { createSupabaseServerClient } from './supabase-server';
import { Profile } from '@/types/database';

/**
 * Get the current user's profile including their role
 * SERVER-SIDE: Uses admin client to bypass RLS
 */
export async function getUserProfileServer(userId: string): Promise<Profile | null> {
  const adminClient = createSupabaseAdmin();

  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Admin authorization middleware for API routes
 * Returns the user profile if authorized, null if not
 * NOTE: This function should ONLY be called from Server Components or API Routes
 */
export async function requireAdmin(): Promise<Profile | null> {
  // Use server-side client that can read cookies
  const serverClient = await createSupabaseServerClient();
  const { data: { session } } = await serverClient.auth.getSession();

  if (!session?.user?.id) {
    console.log('requireAdmin: No session found');
    return null;
  }

  const profile = await getUserProfileServer(session.user.id);

  if (profile?.role !== 'admin') {
    console.log('requireAdmin: User is not admin, role:', profile?.role);
    return null;
  }

  console.log('requireAdmin: Admin verified, email:', session.user.email);
  return profile;
}
