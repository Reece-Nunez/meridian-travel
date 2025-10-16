'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingFallback from '@/components/LoadingFallback';
import { getUserProfile } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        router.push('/auth/signin?error=callback_error');
        return;
      }

      if (data.session) {
        // Check if this is an admin user via database role
        const profile = await getUserProfile(data.session.user.id);
        const isAdmin = profile?.role === 'admin';
        const userEmail = data.session.user?.email;

        if (isAdmin) {
          // Set up admin session for the admin auth system
          localStorage.setItem('admin_session', JSON.stringify({
            email: userEmail,
            loginTime: new Date().toISOString()
          }));

          // Clear any redirect and go to admin
          sessionStorage.removeItem('redirectAfterLogin');
          router.push('/admin');
          return;
        }

        // Regular user flow - redirect to dashboard or intended page
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      } else {
        // No session found, redirect to sign in
        router.push('/auth/signin');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <LoadingFallback
      message="Completing your sign in..."
      onTimeout={() => {
        console.error('Auth callback timeout');
        router.push('/auth/signin?error=callback_timeout');
      }}
    />
  );
}