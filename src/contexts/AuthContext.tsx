'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'apple') => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to check if we're using a dummy Supabase client
  const isDummyClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !supabaseUrl || supabaseUrl === 'https://dummy.supabase.co';
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    if (isDummyClient()) {
      console.warn('Using dummy Supabase client - authentication disabled');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (isMounted) {
            setProfile(profileData);
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Safety timeout to ensure loading never stays true indefinitely
    const safetyTimeout = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event, 'session:', !!session?.user);

        try {
          // Handle specific auth events
          if (event === 'SIGNED_IN') {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              const profileData = await fetchProfile(session.user.id);
              if (isMounted) {
                setProfile(profileData);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('Processing SIGNED_OUT event');
            setSession(null);
            setUser(null);
            setProfile(null);
          } else if (event === 'TOKEN_REFRESHED') {
            // Token refresh - only update if different user
            if (session?.user?.id !== user?.id) {
              setSession(session);
              setUser(session?.user ?? null);
            }
          }

          // Always ensure loading is false after processing
          if (isMounted) {
            setLoading(false);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (isDummyClient()) {
      return { data: null, error: { message: 'Authentication is disabled - Supabase environment variables missing' } as AuthError };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    if (isDummyClient()) {
      return { data: null, error: { message: 'Authentication is disabled - Supabase environment variables missing' } as AuthError };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { data, error };
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting signOut process...');

      if (isDummyClient()) {
        console.warn('AuthContext: Using dummy client - skipping Supabase signOut');
        // Just clear local state for dummy client
        setUser(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
        return { error: null };
      }

      // Always clear local state first, regardless of API call success
      console.log('AuthContext: Clearing local state...');
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);

      // Attempt to sign out from Supabase, but don't fail if session is already invalid
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          // If it's just a session missing error, that's OK - user is already signed out
          if (error.message?.includes('Auth session missing') ||
              error.message?.includes('session missing') ||
              error.status === 403) {
            console.log('AuthContext: Session already invalid - user successfully signed out locally');
            return { error: null };
          }
          console.error('AuthContext: Sign out error:', error);
          // Still return success since local state is cleared
          return { error: null };
        }

        console.log('AuthContext: Supabase signOut successful');
      } catch (supabaseError) {
        console.warn('AuthContext: Supabase signOut failed, but local state cleared:', supabaseError);
        // Local state is cleared, so this is still a success from user perspective
      }

      console.log('AuthContext: Sign out complete');
      return { error: null };
    } catch (catchError) {
      console.error('AuthContext: Sign out catch error:', catchError);
      // Even on error, ensure local state is cleared
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      return { error: null }; // Return success since local state is cleared
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      });

    if (!error) {
      await refreshProfile();
    }

    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}