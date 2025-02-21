import axios from "axios";
import type { AuthResponse, User } from "@supabase/supabase-js";
import type { UserMetadata } from "../../services/auth";
import { supabase } from "../supabase";

interface ApiErrorResponse {
  error: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (error && typeof error === "object" && "isAxiosError" in error) {
      const axiosError = error as {
        response?: {
          status: number;
          data?: ApiErrorResponse;
        };
      };
      if (axiosError.response?.status === 429) {
        throw new Error("Too many requests. Please try again later.");
      }
      if (!axiosError.response) {
        throw new Error("Network error. Please check your connection.");
      }
      throw new Error(
        axiosError.response.data?.error || "An unexpected error occurred"
      );
    }
    throw error;
  }
);

export const apiClient = {
  auth: {
    signIn: async (email: string, password: string): Promise<AuthResponse> => {
      return supabase.auth.signInWithPassword({ email, password });
    },

    signUp: async (email: string, password: string): Promise<AuthResponse> => {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            created_at: new Date().toISOString(),
            last_sign_in: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            sign_in_count: 0,
            onboarding_completed: false,
          },
        },
      });
    },

    signOut: async (): Promise<{ error: null }> => {
      await supabase.auth.signOut();
      return { error: null };
    },

    resetPassword: async (email: string): Promise<{ error: null }> => {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error: null };
    },

    verifyEmail: async (token: string): Promise<{ error: null }> => {
      await supabase.auth.verifyOtp({
        token_hash: token,
        type: "email",
      });
      return { error: null };
    },

    getCurrentUser: async (): Promise<User | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },

    updateMetadata: async (metadata: Partial<UserMetadata>): Promise<void> => {
      await supabase.auth.updateUser({
        data: metadata,
      });
    },
  },
};
