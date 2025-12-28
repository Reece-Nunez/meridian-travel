'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

/**
 * Admin auth hook - consumes AuthContext and checks admin role.
 * Single source of truth: AuthContext handles all auth state.
 * This hook only adds admin role verification on top.
 */
export function useSimpleAdminAuth() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const hasRedirected = useRef(false);

  const supabase = useMemo(() => createClient(), []);

  // Loading = AuthContext loading OR we have a user but haven't checked admin role yet
  const loading = authLoading || (!!user && isAdmin === null);

  // Check admin role once AuthContext finishes loading
  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (authLoading) return;

    // No user from AuthContext - redirect to signin
    if (!user) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/auth/signin');
      }
      return;
    }

    // User exists - check admin role
    const checkAdminRole = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || profile?.role !== 'admin') {
          setIsAdmin(false);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.replace('/dashboard');
          }
        } else {
          setIsAdmin(true);
          hasRedirected.current = false;
        }
      } catch (error) {
        console.error('Admin role check failed:', error);
        setIsAdmin(false);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace('/auth/signin');
        }
      }
    };

    checkAdminRole();
  }, [authLoading, user, supabase, router]);

  // Reset state when user signs out
  useEffect(() => {
    if (!user && !authLoading) {
      setIsAdmin(null);
      hasRedirected.current = false;
    }
  }, [user, authLoading]);

  // Refresh session - for long admin sessions
  const refreshSession = useCallback(async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      return !error;
    } catch {
      return false;
    }
  }, [supabase]);

  const logout = useCallback(async () => {
    hasRedirected.current = true;
    localStorage.removeItem('admin_session');
    await signOut();
    router.replace('/auth/signin');
  }, [signOut, router]);

  return {
    loading,
    isAuthenticated: isAdmin === true,
    logout,
    refreshSession,
  };
}
