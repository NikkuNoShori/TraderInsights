import { supabase } from "../supabase";
import type { AuthResponse, AuthSession } from "@supabase/supabase-js";

export const authService = {
  getSession: async (): Promise<AuthSession | null> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Failed to get session:", error);
      return null;
    }
  },

  signInWithEmail: async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    metadata?: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
    },
  ): Promise<AuthResponse> => {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (response.error) throw response.error;
      return response;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error refreshing session:", error);
      throw error;
    }
  },
};
