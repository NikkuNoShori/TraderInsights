import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupabaseClient, User, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface SupabaseContextType extends AuthState {
  supabase: SupabaseClient;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

interface SupabaseProviderProps {
  children: React.ReactNode;
  supabase: SupabaseClient;
  onAuthChange?: (event: AuthChangeEvent, user: User | null) => void;
}

export function SupabaseProvider({ children, supabase, onAuthChange }: SupabaseProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error checking session:', error);
        setAuthState(prev => ({ ...prev, error, loading: false }));
        return;
      }

      setAuthState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false
        }));

        // Notify parent component of auth changes
        if (onAuthChange) {
          onAuthChange(event, session?.user ?? null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, onAuthChange]);

  const value = {
    ...authState,
    supabase,
    signIn: async (email: string, password: string) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      } catch (error) {
        toast.error('Failed to sign in');
        throw error;
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      } catch (error) {
        toast.error('Failed to sign out');
        throw error;
      }
    },
    refreshSession: async () => {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        toast.error('Session expired');
        throw error;
      }
    }
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
