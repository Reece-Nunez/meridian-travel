'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useSimpleAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const session = localStorage.getItem('admin_session');
        
        if (!session) {
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        const sessionData = JSON.parse(session);
        const loginTime = new Date(sessionData.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        // Session expires after 8 hours
        if (hoursDiff > 8) {
          localStorage.removeItem('admin_session');
          setLoading(false);
          router.push('/admin/login');
          return;
        }

        // Check if it's the valid admin email
        if (sessionData.email === 'chris@meridianluxury.travel') {
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          localStorage.removeItem('admin_session');
          setLoading(false);
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('admin_session');
        setLoading(false);
        router.push('/admin/login');
      }
    };

    // Add a small delay to ensure localStorage is ready
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [router]);

  const logout = () => {
    localStorage.removeItem('admin_session');
    router.push('/admin/login');
  };

  return { loading, isAuthenticated, logout };
}