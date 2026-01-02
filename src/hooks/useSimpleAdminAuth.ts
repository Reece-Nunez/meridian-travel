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
  const [waitingForAuth, setWaitingForAuth] = useState(true);
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Use singleton Supabase client
  const supabase = useMemo(() => createClient(), []);

  // Loading = AuthContext loading OR waiting for auth OR we have a user but haven't checked admin role yet
  const loading = authLoading || waitingForAuth || (!!user && isAdmin === null);

  // Debug logging
  useEffect(() => {
    console.log('[useSimpleAdminAuth] State:', {
      authLoading,
      waitingForAuth,
      hasUser: !!user,
      userId: user?.id?.substring(0, 8),
      isAdmin,
      loading,
      hasRedirected: hasRedirected.current
    });
  }, [authLoading, waitingForAuth, user, isAdmin, loading]);

  // Give auth a chance to initialize before redirecting
  useEffect(() => {
    console.log('[useSimpleAdminAuth] Starting 500ms wait timer');
    const timer = setTimeout(() => {
      console.log('[useSimpleAdminAuth] Wait timer complete, setting waitingForAuth=false');
      setWaitingForAuth(false);
    }, 500); // Wait 500ms for auth to settle

    return () => clearTimeout(timer);
  }, []);

  // Check admin role once AuthContext finishes loading
  useEffect(() => {
    console.log('[useSimpleAdminAuth] Role check effect:', { authLoading, waitingForAuth, hasUser: !!user });

    // Wait for AuthContext to finish loading and initial wait period
    if (authLoading || waitingForAuth) {
      console.log('[useSimpleAdminAuth] Still waiting for auth...');
      return;
    }

    // No user from AuthContext - redirect to signin
    if (!user) {
      console.log('[useSimpleAdminAuth] No user, redirecting to signin');
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/auth/signin');
      }
      return;
    }

    // User exists - check admin role
    const checkAdminRole = async () => {
      console.log('[useSimpleAdminAuth] Checking admin role for user:', user.id.substring(0, 8));
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('[useSimpleAdminAuth] Profile check result:', { profile, error: error?.message });

        if (error || profile?.role !== 'admin') {
          console.log('[useSimpleAdminAuth] Not admin, redirecting to dashboard');
          setIsAdmin(false);
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            router.replace('/dashboard');
          }
        } else {
          console.log('[useSimpleAdminAuth] Admin verified!');
          setIsAdmin(true);
          hasRedirected.current = false;
        }
      } catch (error) {
        console.error('[useSimpleAdminAuth] Admin role check failed:', error);
        setIsAdmin(false);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace('/auth/signin');
        }
      }
    };

    checkAdminRole();
  }, [authLoading, waitingForAuth, user, supabase, router]);

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
