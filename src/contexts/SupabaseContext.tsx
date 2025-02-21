import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SupabaseClient, User, AuthChangeEvent } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import type { Database } from '../types/database';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface SupabaseProviderProps {
  children: React.ReactNode;
  supabase: SupabaseClient<Database>;
  onAuthChange?: (event: AuthChangeEvent, user: User | null) => void;
}

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

export function SupabaseProvider({ children, supabase, onAuthChange }: SupabaseProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  const handleAuthStateChange = useCallback(async (event: AuthChangeEvent, session: any) => {
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
  }, [onAuthChange]);

  useEffect(() => {
    let mounted = true;

    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

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
      } catch (error) {
        if (!mounted) return;
        console.error('Unexpected error checking session:', error);
        setAuthState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error : new Error('Unknown error'),
          loading: false 
        }));
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, handleAuthStateChange]);

  return (
    <SupabaseContext.Provider value={{
      supabase,
      user: authState.user,
      loading: authState.loading,
      error: authState.error
    }}>
      {children}
    </SupabaseContext.Provider>
  );
}
