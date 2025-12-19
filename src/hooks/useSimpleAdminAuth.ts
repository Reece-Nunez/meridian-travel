'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { getUserProfile } from '@/lib/auth';

export function useSimpleAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();
  const routerRef = useRef(router);
  const isAdminRef = useRef(false);

  // Keep router ref up to date
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Function to refresh session - can be called before save operations
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 [ADMIN AUTH] Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('🔴 [ADMIN AUTH] Session refresh error:', error);
        return false;
      }
      console.log('🟢 [ADMIN AUTH] Session refreshed successfully');
      return !!data.session;
    } catch (error) {
      console.error('🔴 [ADMIN AUTH] Session refresh exception:', error);
      return false;
    }
  }, []);

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

        // Check actual Supabase session instead of localStorage
        console.log('🟣 [ADMIN AUTH] Checking Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🟣 [ADMIN AUTH] Session result:', {
          hasSession: !!session,
          email: session?.user?.email,
          hasError: !!error,
          timestamp: new Date().toISOString()
        });

        if (error) {
          console.error('🔴 [ADMIN AUTH] Session check error:', error);
          if (isMounted) {
            console.log('🔴 [ADMIN AUTH] Error - redirecting to /auth/signin');
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        if (!session) {
          // No session - redirect to login
          if (isMounted) {
            console.log('🔴 [ADMIN AUTH] No session - redirecting to /auth/signin');
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        // Check if user has admin role in database
        const profile = await getUserProfile(session.user.id);
        const isAdmin = profile?.role === 'admin';
        isAdminRef.current = isAdmin;
        console.log('🟣 [ADMIN AUTH] Admin check - isAdmin:', isAdmin, 'role:', profile?.role, 'email:', session.user.email);

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
      async (event, session) => {
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
  }, []); // Empty dependency array - only run once on mount

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
