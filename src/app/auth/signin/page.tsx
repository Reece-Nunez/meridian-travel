'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LoadingFallback from '@/components/LoadingFallback';
import { getUserProfile } from '@/lib/auth';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteToken, setQuoteToken] = useState<string | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<any>(null);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { signIn, signInWithOAuth, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  // Redirect authenticated users (only once)
  useEffect(() => {
    console.log('🔵 [SIGNIN] useEffect triggered:', {
      hasUser: !!user,
      userEmail: user?.email,
      authLoading,
      hasRedirected,
      timestamp: new Date().toISOString()
    });

    if (user && !authLoading && !hasRedirected) {
      console.log('🟢 [SIGNIN] Conditions met for redirect, setting hasRedirected=true');
      setHasRedirected(true);

      // Check user role from database
      getUserProfile(user.id).then((profile) => {
        const isAdmin = profile?.role === 'admin';
        const targetPath = isAdmin ? '/admin' : redirectTo;
        console.log('🟢 [SIGNIN] Redirecting to:', targetPath, '(isAdmin:', isAdmin + ')');
        if (isAdmin) {
          router.replace('/admin');
        } else {
          router.replace(redirectTo);
        }
      });
    } else {
      console.log('🔴 [SIGNIN] Redirect blocked - conditions not met');
    }
  }, [user, authLoading, hasRedirected, router, redirectTo]);

  // Check for quote token on component mount
  useEffect(() => {
    const token = searchParams.get('quote_token');
    if (token) {
      setQuoteToken(token);
      validateQuoteToken(token);
    }
  }, [searchParams]);

  const validateQuoteToken = async (token: string) => {
    try {
      const response = await fetch(`/api/quote-tokens/validate?token=${token}`);
      if (response.ok) {
        const data = await response.json();
        setQuoteInfo(data);
        setEmail(data.email); // Pre-fill email from quote
      } else {
        console.error('Invalid quote token');
        setError('Invalid or expired quote link. Please request a new quote.');
      }
    } catch (error) {
      console.error('Error validating quote token:', error);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setFormLoading(false);
    } else {
      // Set up admin session if this is an admin user
      let isAdmin = false;
      if (data?.user?.id) {
        const profile = await getUserProfile(data.user.id);
        isAdmin = profile?.role === 'admin';
        if (isAdmin) {
          localStorage.setItem('admin_session', JSON.stringify({
            email: email,
            loginTime: new Date().toISOString()
          }));
        }
      }

      // Handle quote token attachment for regular users
      if (quoteToken && data?.user?.id && !isAdmin) {
        try {
          await fetch('/api/quote-tokens/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: quoteToken,
              userId: data.user.id
            }),
          });
        } catch (attachError) {
          console.error('Failed to attach quote to account:', attachError);
        }
      }

      // The useEffect will handle the actual redirect once user state updates
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'apple') => {
    setFormLoading(true);
    setError(null);

    // Store redirect URL for after OAuth
    sessionStorage.setItem('redirectAfterLogin', redirectTo);

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(error.message);
      setFormLoading(false);
    }
    // Note: OAuth redirect will happen automatically, so we don't set loading back to false here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-auto flex justify-center">
            <img 
              src="/logo.png" 
              alt="Meridian Luxury Travel" 
              className="h-12 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#8B4513]">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-[#B8860B] hover:text-[#DAA520]">
              create a new account
            </Link>
          </p>
        </div>

        {(error || errorParam) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">
              {error || (errorParam === 'callback_error' ? 'Authentication failed. Please try again.' : errorParam)}
            </div>
          </div>
        )}

        {quoteInfo && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-semibold text-green-800">Quote Approved!</p>
            </div>
            <div className="text-sm text-green-700">
              <p><strong>{quoteInfo.quote?.destination}</strong> • {quoteInfo.quote?.duration} days</p>
              <p className="text-lg font-bold text-green-800">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: quoteInfo.quote?.quoted_currency || 'USD',
                }).format(quoteInfo.quote?.quoted_price || 0)}
              </p>
              <p className="mt-2 text-xs">Sign in to attach this quote to your existing account.</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-[#B8860B] hover:text-[#DAA520]"
            >
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={formLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#F5F5DC] bg-[#B8860B] hover:bg-[#DAA520] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#F5F5DC] text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={formLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('apple')}
                disabled={formLoading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="ml-2">Apple</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <LoadingFallback message="Loading sign in..." />
    }>
      <SignInForm />
    </Suspense>
  );
}