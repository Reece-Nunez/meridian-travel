'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingFallback from '@/components/LoadingFallback';

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
        // User is authenticated, redirect to dashboard or intended page
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