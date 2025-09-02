'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function useAdminAuth() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
          router.push('/admin/login');
          return;
        }

        // Check if user is authorized admin
        const adminEmails = [
          'chris@meridianluxury.travel',
          'chrispinto@meridianluxury.travel',
          'admin@meridianluxury.travel'
        ];

        if (!adminEmails.includes(session.user.email || '')) {
          router.push('/unauthorized');
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return { loading, isAuthenticated };
}