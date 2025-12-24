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
      console.log('🔄 [ADMIN AUTH] Validating session...');
      const startTime = Date.now();

      // Use getUser() which validates against server/cookies (not local cache)
      // This is the recommended approach for SSR cookie-based auth
      const { data: { user }, error } = await supabase.auth.getUser();

      console.log(`🔄 [ADMIN AUTH] Session validation took ${Date.now() - startTime}ms`);

      if (error) {
        console.error('🔴 [ADMIN AUTH] Session validation error:', error);
        // Try to refresh the session if validation failed
        console.log('🔄 [ADMIN AUTH] Attempting session refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          console.error('🔴 [ADMIN AUTH] Session refresh failed:', refreshError);
          return false;
        }
        console.log('🟢 [ADMIN AUTH] Session refreshed successfully');
        return true;
      }

      if (user) {
        console.log(`🟢 [ADMIN AUTH] Session valid for user: ${user.email} (validated in ${Date.now() - startTime}ms)`);
        return true;
      }

      console.log('🔴 [ADMIN AUTH] No user found in session');
      return false;
    } catch (error: any) {
      console.error('🔴 [ADMIN AUTH] Session validation exception:', error?.message || error);
      return false;
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    // Fallback timeout to prevent infinite loading - increased to 10 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth check timeout, forcing login redirect');
        setIsAuthenticated(false);
        setLoading(false);
        routerRef.current.push('/auth/signin');
      }
    }, 10000); // 10 second timeout

    const checkAuth = async () => {
      console.log('🟣 [ADMIN AUTH] checkAuth started, isMounted:', isMounted);
      try {
        if (!isMounted) {
          console.log('🟣 [ADMIN AUTH] Component unmounted, exiting');
          return;
        }

        // Use getUser() for proper cookie-based SSR auth validation
        // getSession() reads from cache, getUser() validates against server
        console.log('🟣 [ADMIN AUTH] Validating user session...');
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('🟣 [ADMIN AUTH] User validation result:', {
          hasUser: !!user,
          email: user?.email,
          hasError: !!error,
          errorMessage: error?.message,
          timestamp: new Date().toISOString()
        });

        if (error) {
          console.error('🔴 [ADMIN AUTH] User validation error:', error);
          if (isMounted) {
            console.log('🔴 [ADMIN AUTH] Error - redirecting to /auth/signin');
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        if (!user) {
          // No user - redirect to login
          if (isMounted) {
            console.log('🔴 [ADMIN AUTH] No user found - redirecting to /auth/signin');
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
        console.log('🟣 [ADMIN AUTH] Admin check - isAdmin:', isAdmin, 'role:', profile?.role, 'email:', user.email);

        if (isAdmin) {
          if (isMounted) {
            console.log('🟢 [ADMIN AUTH] Admin verified - setting authenticated=true, clearing timeout');
            clearTimeout(fallbackTimer);
            setIsAuthenticated(true);
            setLoading(false);
          } else {
            console.log('🟡 [ADMIN AUTH] Admin verified but component unmounted');
          }
        } else {
          // Not an admin - redirect
          if (isMounted) {
            console.log('🔴 [ADMIN AUTH] Not admin - redirecting to /dashboard');
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            routerRef.current.push('/dashboard'); // Regular users go to dashboard
          }
        }
      } catch (error) {
        console.error('🔴 [ADMIN AUTH] Auth check error:', error);
        if (isMounted) {
          console.log('🔴 [ADMIN AUTH] Exception - redirecting to /auth/signin');
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

        console.log('🟣 [ADMIN AUTH] Auth state change:', event);

        if (event === 'SIGNED_OUT') {
          console.log('🔴 [ADMIN AUTH] User signed out - redirecting to login');
          setIsAuthenticated(false);
          setLoading(false);
          routerRef.current.push('/auth/signin');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🟢 [ADMIN AUTH] Token refreshed');
          // Session is still valid, no action needed
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
        console.log('🔄 [ADMIN AUTH] Periodic session refresh...');
        await refreshSession();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      console.log('🧹 [ADMIN AUTH] Cleanup - clearing timeout, interval, and marking unmounted');
      isMounted = false;
      clearTimeout(fallbackTimer);
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    };
  }, [supabase, getUserProfile, refreshSession, router]);

  const logout = async () => {
    try {
      // Clear any legacy admin session
      localStorage.removeItem('admin_session');
      // Sign out from Supabase
      await signOut();
      routerRef.current.push('/auth/signin');
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still redirect even if signOut fails
      routerRef.current.push('/auth/signin');
    }
  };

  return { loading, isAuthenticated, logout, refreshSession };
}
