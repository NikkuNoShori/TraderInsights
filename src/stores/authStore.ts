import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { UserProfile as Profile } from "@/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username: string,
    fullName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  handleAuthStateChange: (event: string, session: Session | null) => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  // State
  user: null,
  profile: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (!authData.user) throw new Error("No user data returned");

      // Fetch profile after successful sign in
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;
      set({ user: authData.user, profile });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, username, fullName) => {
    set({ isLoading: true, error: null });
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned");

      // Create user profile
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: authData.user.id,
          username,
          full_name: fullName,
        },
      ]);

      if (profileError) throw profileError;

      // Set user data
      set({ user: authData.user });
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
      set({ user: null, profile: null });
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
        // Fetch profile when signed in
        if (session?.user) {
          try {
            // First try to fetch the profile
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              // If profile doesn't exist, create one
              if (profileError.code === "PGRST116") {
                const { data: newProfile, error: createError } = await supabase
                  .from("profiles")
                  .insert([
                    {
                      id: session.user.id,
                      username: session.user.email?.split("@")[0] || "user",
                      full_name: session.user.user_metadata?.full_name || "",
                    },
                  ])
                  .select()
                  .single();

                if (createError) {
                  console.error("Error creating profile:", createError);
                  return;
                }

                set({ profile: newProfile });
                return;
              }
              console.error("Error fetching profile:", profileError);
              return;
            }

            set({ profile });
          } catch (error) {
            console.error("Error in handleAuthStateChange:", error);
          }
        }
        break;
      case "SIGNED_OUT":
        set({ user: null, profile: null });
        break;
    }
  },
}));
