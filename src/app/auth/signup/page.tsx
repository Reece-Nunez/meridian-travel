'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingEmail, setExistingEmail] = useState(false);
  const [quoteToken, setQuoteToken] = useState<string | null>(null);
  const [quoteInfo, setQuoteInfo] = useState<any>(null);
  const { signUp, signInWithOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const { exists } = await response.json();
        return exists;
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
    return false;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExistingEmail(false);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Check if email already exists before attempting signup
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setError('This email is already associated with an account.');
      setExistingEmail(true);
      setLoading(false);
      return;
    }

    const { data, error } = await signUp(email, password);

    if (error) {
      // Check if the error is related to existing email
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') ||
          error.message.includes('already exists')) {
        setError(`This email is already associated with an account.`);
        setExistingEmail(true);
      } else {
        setError(error.message);
        setExistingEmail(false);
      }
      setLoading(false);
    } else {
      // If there's a quote token, attach it to the user account
      if (quoteToken && data?.user?.id) {
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
          console.log('Quote attached to new user account');
        } catch (attachError) {
          console.error('Failed to attach quote to account:', attachError);
          // Don't fail signup if quote attachment fails
        }
      }
      
      setSuccess(true);
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true);
    setError(null);

    // Store redirect URL for after OAuth
    sessionStorage.setItem('redirectAfterLogin', '/dashboard');

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
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
              Check your email
            </h2>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm text-green-600">
              <p className="mb-2">We've sent you a confirmation email at:</p>
              <p className="font-semibold">{email}</p>
              <p className="mt-2">Please check your email and click the confirmation link to activate your account.</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-gray-600">
              Didn't receive the email?{' '}
              <button
                onClick={() => setSuccess(false)}
                className="font-medium text-[#B8860B] hover:text-[#DAA520]"
              >
                Try again
              </button>
            </p>
            <p className="mt-4 text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="font-medium text-[#B8860B] hover:text-[#DAA520]">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-[#B8860B] hover:text-[#DAA520]">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className={`${existingEmail ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border rounded-md p-4`}>
            <div className={`text-sm ${existingEmail ? 'text-blue-600' : 'text-red-600'}`}>
              {error}
              {existingEmail && (
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/auth/signin${quoteToken ? `?quote_token=${quoteToken}` : ''}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#B8860B] hover:bg-[#DAA520] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B]"
                  >
                    Sign in to existing account
                  </Link>
                  <p className="text-xs text-blue-500">
                    Or use a different email address to create a new account.
                  </p>
                </div>
              )}
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
              <p className="mt-2 text-xs">Creating an account will automatically attach this quote to your profile.</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                  setExistingEmail(false);
                }}
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
                autoComplete="new-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] focus:z-10 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#B8860B] focus:border-[#B8860B] focus:z-10 sm:text-sm"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#F5F5DC] bg-[#B8860B] hover:bg-[#DAA520] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8860B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
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
                onClick={() => handleOAuthSignUp('google')}
                disabled={loading}
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
                onClick={() => handleOAuthSignUp('github')}
                disabled={loading}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>
            </div>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center mt-4">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[#B8860B] hover:text-[#DAA520]">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#B8860B] hover:text-[#DAA520]">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}