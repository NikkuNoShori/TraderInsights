import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const context = useSupabase();
  
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await context.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error };
    }
  };

  return {
    signIn,
  };
} 