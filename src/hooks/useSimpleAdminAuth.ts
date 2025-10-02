'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export function useSimpleAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    let isMounted = true;

    // Fallback timeout to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth check timeout, forcing login redirect');
        setIsAuthenticated(false);
        setLoading(false);
        router.push('/auth/signin');
      }
    }, 5000); // 5 second timeout

    const checkAuth = async () => {
      try {
        if (!isMounted) return;

        // Check actual Supabase session instead of localStorage
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Session check error:', error);
          if (isMounted) {
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
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        // Check if it's the admin email
        const isAdmin = session.user.email === 'chris@meridianluxury.travel';

        if (isAdmin) {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(true);
            setLoading(false);
          }
        } else {
          // Not an admin - redirect
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/dashboard'); // Regular users go to dashboard
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

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  const logout = async () => {
    try {
      // Clear any legacy admin session
      localStorage.removeItem('admin_session');
      // Sign out from Supabase
      await signOut();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Admin logout error:', error);
      // Still redirect even if signOut fails
      router.push('/auth/signin');
    }
  };

  return { loading, isAuthenticated, logout };
}