'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export function useSimpleAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();
  const routerRef = useRef(router);
  const isAdminRef = useRef(false);

  // Create a stable Supabase client instance
  const supabase = useMemo(() => createClient(), []);

  // Keep router ref up to date
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Helper to get user profile from database
  const getUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }, [supabase]);

  // Function to refresh session - can be called before save operations
  // Uses getUser() instead of getSession() for proper cookie-based SSR auth validation
  const refreshSession = useCallback(async () => {
    try {
      // Use getUser() which validates against server/cookies (not local cache)
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        // Try to refresh the session if validation failed
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          return false;
        }
        return true;
      }

      return !!user;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // Fallback timeout to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading) {
        setIsAuthenticated(false);
        setLoading(false);
        routerRef.current.push('/auth/signin');
      }
    }, 10000);

    const checkAuth = async () => {
      try {
        if (!isMounted) return;

        // Use getUser() for proper cookie-based SSR auth validation
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        if (!user) {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        // Check if user has admin role in database
        const profile = await getUserProfile(user.id);
        const isAdmin = profile?.role === 'admin';
        isAdminRef.current = isAdmin;

        if (isAdmin) {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(true);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            routerRef.current.push('/dashboard');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          clearTimeout(fallbackTimer);
          setIsAuthenticated(false);
          setLoading(false);
          router.push('/auth/signin');
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setLoading(false);
          routerRef.current.push('/auth/signin');
        } else if (event === 'SIGNED_IN' && session) {
          // Re-verify admin status on sign in
          const profile = await getUserProfile(session.user.id);
          const isAdmin = profile?.role === 'admin';
          isAdminRef.current = isAdmin;
          if (isAdmin) {
            setIsAuthenticated(true);
          }
        }
      }
    );

    // Set up periodic session refresh every 5 minutes to keep session alive
    const refreshInterval = setInterval(async () => {
      if (isMounted && isAdminRef.current) {
        await refreshSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, [supabase, getUserProfile, refreshSession, router]);

  const logout = async () => {
    try {
      localStorage.removeItem('admin_session');
      await signOut();
      routerRef.current.push('/auth/signin');
    } catch (error) {
      console.error('Admin logout error:', error);
      routerRef.current.push('/auth/signin');
    }
  };

  return { loading, isAuthenticated, logout, refreshSession };
}
