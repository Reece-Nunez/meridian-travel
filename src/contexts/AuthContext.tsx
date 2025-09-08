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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Session initialization error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'session:', !!session?.user);
        
        // Handle auth state changes but avoid unnecessary loading states
        if (event === 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }
          
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('Processing SIGNED_OUT event');
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token refresh should not trigger loading states or UI changes
          // Only update session and user if they're different
          if (session?.user?.id !== user?.id) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        } else if (event === 'INITIAL_SESSION') {
          // Handle initial session load
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
          }
          
          setLoading(false);
        } else {
          // For any other events, ensure loading is false but don't change user state
          console.log('Other auth event:', event, '- ensuring loading is false');
          setLoading(false);
        }
      }
    );

    return () => {
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

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthContext: Sign out error:', error);
        return { error };
      }
      
      console.log('AuthContext: Supabase signOut successful, clearing state...');
      
      // Clear state immediately on successful signOut
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      
      console.log('AuthContext: Local state cleared');
      
      return { error: null };
    } catch (catchError) {
      console.error('AuthContext: Sign out catch error:', catchError);
      return { error: catchError as AuthError };
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