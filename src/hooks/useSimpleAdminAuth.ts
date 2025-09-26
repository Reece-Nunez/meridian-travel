'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSimpleAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

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
        // Add a small delay to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (!isMounted) return;
        
        const session = localStorage.getItem('admin_session');
        
        if (!session) {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        const sessionData = JSON.parse(session);
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        // Session expires after 8 hours
        if (hoursDiff > 8) {
          localStorage.removeItem('admin_session');
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
          return;
        }

        // Check if it's the valid admin email
        if (sessionData.email === 'chris@meridianluxury.travel') {
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(true);
            setLoading(false);
          }
        } else {
          localStorage.removeItem('admin_session');
          if (isMounted) {
            clearTimeout(fallbackTimer);
            setIsAuthenticated(false);
            setLoading(false);
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        try {
          localStorage.removeItem('admin_session');
        } catch {}
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

  const logout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  return { loading, isAuthenticated, logout };
}