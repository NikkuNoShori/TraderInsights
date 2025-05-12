import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";
import { persist } from "zustand/middleware";

// Helper function to get a readonly userId
export const getUserId = (user: User | null): string | null => {
  if (!user) return null;
  return user.id;
};

export interface SnapTradeCredentials {
  userId: string;
  userSecret: string;
}

// Define minimal profile interface for creating profiles from auth data
export interface BasicProfile {
  id: string;
  email: string | undefined;
  username: string;
  username_changes_remaining: number;
  last_username_change: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  snapTradeCredentials: SnapTradeCredentials | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSnapTradeCredentials: (credentials: SnapTradeCredentials | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleAuthStateChange: (event: string, session: Session | null) => void;
  saveSnapTradeCredentials: (
    credentials: SnapTradeCredentials
  ) => Promise<void>;
  fetchSnapTradeCredentials: (userId: string) => Promise<void>;
  removeSnapTradeCredentials: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      snapTradeCredentials: null,
      isInitialized: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSnapTradeCredentials: (credentials) =>
        set({ snapTradeCredentials: credentials }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // New method to save SnapTrade credentials to Supabase
      saveSnapTradeCredentials: async (credentials) => {
        const { user } = get();
        if (!user) return;

        try {
          // Store credentials in Supabase using upsert (insert if not exists, update if exists)
          const { error } = await supabase
            .from("snaptrade_credentials")
            .upsert({
              user_id: user.id,
              snaptrade_user_id: credentials.userId,
              snaptrade_user_secret: credentials.userSecret,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error("Error saving SnapTrade credentials:", error);
            throw error;
          }

          // Update local state after saving to Supabase
          set({ snapTradeCredentials: credentials });
        } catch (error) {
          console.error("Failed to save SnapTrade credentials:", error);
        }
      },

      // New method to fetch SnapTrade credentials from Supabase
      fetchSnapTradeCredentials: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("snaptrade_credentials")
            .select("*")
            .eq("user_id", userId)
            .single();

          if (error) {
            // Only log as error if it's not a "not found" error
            if (error.code !== "PGRST116") {
              console.error("Error fetching SnapTrade credentials:", error);
            } else {
              console.log("No SnapTrade credentials found for user");
            }
            return;
          }

          if (data) {
            // Update local state with fetched credentials
            set({
              snapTradeCredentials: {
                userId: data.snaptrade_user_id,
                userSecret: data.snaptrade_user_secret,
              },
            });
          }
        } catch (error) {
          console.error("Failed to fetch SnapTrade credentials:", error);
        }
      },

      // New method to remove SnapTrade credentials from Supabase
      removeSnapTradeCredentials: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { error } = await supabase
            .from("snaptrade_credentials")
            .delete()
            .eq("user_id", user.id);

          if (error) {
            console.error("Error removing SnapTrade credentials:", error);
            throw error;
          }

          // Clear local state after removing from Supabase
          set({ snapTradeCredentials: null });
        } catch (error) {
          console.error("Failed to remove SnapTrade credentials:", error);
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data: authData, error } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });
          if (error) throw error;

          if (!authData?.user) {
            throw new Error("No user data returned from sign in");
          }

          // Skip profile fetch and use default profile
          const defaultProfile: BasicProfile = {
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.email?.split("@")[0] || "user",
            username_changes_remaining: 3,
            last_username_change: null,
            first_name: "",
            last_name: "",
            date_of_birth: null,
            role: "user",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          set({ profile: defaultProfile as UserProfile });

          // Fetch SnapTrade credentials for this user
          const store = get();
          await store.fetchSnapTradeCredentials(authData.user.id);

          /* Commenting out profile fetch for now due to 406 errors
          // Fetch profile after successful sign in
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .single();

          if (profileError) {
            console.warn("Error fetching profile during sign in:", profileError.message);
            // Create a basic profile from user data if we can't fetch it
            const basicProfile = {
              id: authData.user.id,
              email: authData.user.email,
              username: authData.user.email?.split('@')[0] || 'user',
              first_name: '',
              last_name: '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            set({ profile: basicProfile });
            
            // Try to create the profile if it doesn't exist
            if (profileError.message.includes("no rows")) {
              const { error: insertError } = await supabase
                .from("profiles")
                .insert([basicProfile]);
                
              if (insertError) {
                console.error("Failed to create profile during sign in:", insertError);
              } else {
                console.log("Profile created successfully during sign in");
              }
            }
          } else {
            set({ profile });
          }
          */
        } catch (error) {
          set({ error: error as Error });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;
        } catch (error) {
          set({ error: error as Error });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ user: null, profile: null, snapTradeCredentials: null });
        } catch (error) {
          set({ error: error as Error });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      handleAuthStateChange: async (event, session) => {
        switch (event) {
          case "SIGNED_IN":
            set({ user: session?.user || null, error: null });
            // Create a basic profile directly from user data without fetching
            if (session?.user) {
              // Skip profile fetch and directly use user data as profile
              const defaultProfile: BasicProfile = {
                id: session.user.id,
                email: session.user.email,
                username: session.user.email?.split("@")[0] || "user",
                username_changes_remaining: 3,
                last_username_change: null,
                first_name: "",
                last_name: "",
                date_of_birth: null,
                role: "user",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              set({ profile: defaultProfile as UserProfile });

              // Fetch SnapTrade credentials for this user
              const store = get();
              await store.fetchSnapTradeCredentials(session.user.id);
            }
            break;
          case "SIGNED_OUT":
            set({
              user: null,
              profile: null,
              snapTradeCredentials: null,
              error: null,
            });
            break;
          case "USER_UPDATED":
            set({ user: session?.user || null });
            break;
          case "USER_DELETED":
            set({ user: null, profile: null });
            break;
          default:
            break;
        }
      },
    }),
    {
      name: "trader-insights-auth",
      partialize: (state) => ({
        snapTradeCredentials: state.snapTradeCredentials,
        user: state.user,
        profile: state.profile,
        isInitialized: state.isInitialized,
      }),
    }
  )
);
