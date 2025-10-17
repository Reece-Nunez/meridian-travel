/**
 * Centralized authentication and authorization utilities
 * This module provides role-based access control using database roles
 */

import { supabase, createSupabaseAdmin } from './supabase';
import { UserRole, Profile } from '@/types/database';

/**
 * Get the current user's profile including their role
 * CLIENT-SIDE: Fetches via API route to bypass RLS
 * SERVER-SIDE: Uses admin client to bypass RLS
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  // Check if we're on the client side
  if (typeof window !== 'undefined') {
    // Client-side: use API route
    try {
      const response = await fetch(`/api/auth/profile?userId=${userId}`);
      if (!response.ok) {
        console.error('Error fetching user profile via API:', response.statusText);
        return null;
      }
      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Server-side: use admin client to bypass RLS
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
 * Check if the current user is an admin based on their profile role
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === 'admin';
}

/**
 * Check if the current user has a specific role
 */
export async function userHasRole(userId: string, role: UserRole): Promise<boolean> {
  const profile = await getUserProfile(userId);
  return profile?.role === role;
}

/**
 * Get the current session user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return null;
  }

  return getUserProfile(session.user.id);
}

/**
 * Check if the current session user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === 'admin';
}

/**
 * Check if a user email should be assigned admin role on signup
 * This is a fallback for the database trigger
 */
export function shouldBeAdmin(email: string): boolean {
  const adminEmails = [
    'chris@meridianluxury.travel',
    'reece@nunezdev.com'
  ];

  return adminEmails.includes(email.toLowerCase());
}
