import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "../types/database";
import type { UserPermissions } from "../types/auth";
import { config } from "../config/index";
import { fetchProfile, fetchPermissions } from "../lib/utils/auth";
import { apiClient } from "../lib/services/apiClient";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  permissions: UserPermissions;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDeveloper: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  setError: (error: Error | null) => void;
  setInitialized: (value: boolean) => void;
  handleAuthStateChange: (event: string, session: any) => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      permissions: {},
      loading: false,
      error: null,
      initialized: false,

      // Actions
      setError: (error) => set({ error }),
      setInitialized: (value) => set({ initialized: value, loading: false }),

      handleAuthStateChange: async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);

        // Don't set loading state for auth state changes
        try {
          switch (event) {
            case "SIGNED_IN":
            case "USER_UPDATED":
              const user = session?.user;
              if (user) {
                const profile = await fetchProfile(user.id);
                const permissions = await fetchPermissions(user.id);
                set({
                  user,
                  profile,
                  permissions,
                  loading: false,
                  initialized: true,
                  error: null,
                });
              }
              break;
            case "SIGNED_OUT":
              set({
                user: null,
                profile: null,
                permissions: {},
                loading: false,
                initialized: true,
                error: null,
              });
              break;
            default:
              set({ loading: false, initialized: true });
          }
        } catch (error) {
          console.error("Error handling auth state change:", error);
          set({
            error: error as Error,
            loading: false,
            initialized: true,
          });
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { data: response, error } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (error) throw error;
          if (!response.user)
            throw new Error("No user returned from authentication");

          // Don't set state here - let the auth state change handler do it
          return;
        } catch (error) {
          console.error("Sign in error:", error);
          set({ error: error as Error, loading: false });
          throw error;
        }
      },

      signOut: async () => {
        set({ loading: true, error: null });
        try {
          if (config.isProduction) {
            await apiClient.auth.signOut();
          }
          set({
            user: null,
            profile: null,
            permissions: {},
            loading: false,
            initialized: true,
          });
        } catch (error) {
          console.error("Sign out error:", error);
          set({ error: error as Error, loading: false });
          throw error;
        }
      },

      loginAsDeveloper: async () => {
        try {
          const mockUser = {
            id: "dev-123",
            email: "developer@example.com",
            app_metadata: {},
            user_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            role: "authenticated",
            updated_at: new Date().toISOString(),
          } as User;

          const mockProfile: Profile = {
            id: "dev-123",
            email: "developer@example.com",
            username: "developer",
            username_changes_remaining: 3,
            last_username_change: null,
            first_name: "Dev",
            last_name: "User",
            date_of_birth: null,
            created_at: new Date().toISOString(),
            role: "developer",
          };

          set({
            user: mockUser,
            profile: mockProfile,
            permissions: {
              "dashboard.access": true,
              "journal.access": true,
              "screener.access": true,
            },
            loading: false,
            initialized: true,
          });
        } catch (error) {
          console.error("Developer login error:", error);
          set({ error: error as Error, loading: false });
          throw error;
        }
      },

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) throw new Error("No user logged in");

        try {
          if (config.isProduction) {
            await apiClient.auth.updateMetadata({
              ...data,
              last_seen_at: new Date().toISOString(),
            });
          }
          set((state) => ({
            profile: state.profile ? { ...state.profile, ...data } : null,
          }));
        } catch (error) {
          console.error("Profile update error:", error);
          set({ error: error as Error });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        permissions: state.permissions,
      }),
    }
  )
);
