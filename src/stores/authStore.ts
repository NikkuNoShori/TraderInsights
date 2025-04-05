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
  signUp: (email: string, password: string) => Promise<void>;
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

      if (!authData?.user) {
        throw new Error("No user data returned from sign in");
      }

      // Skip profile fetch and use default profile
      const defaultProfile = {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.email?.split('@')[0] || 'user',
        first_name: '',
        last_name: '',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      set({ profile: defaultProfile });

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
      set({ user: null, profile: null });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  handleAuthStateChange: (event, session) => {
    switch (event) {
      case "SIGNED_IN":
        set({ user: session?.user || null, error: null });
        // Create a basic profile directly from user data without fetching
        if (session?.user) {
          // Skip profile fetch and directly use user data as profile
          const defaultProfile = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.email?.split('@')[0] || 'user',
            first_name: '',
            last_name: '',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          set({ profile: defaultProfile });
          
          /* Commenting out profile fetch for now due to 406 errors
          supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.warn("Error fetching profile:", error.message);
                // Create a basic profile from user data if we can't fetch it
                const basicProfile = session.user ? {
                  id: session.user.id,
                  email: session.user.email,
                  username: session.user.email?.split('@')[0] || 'user',
                  first_name: '',
                  last_name: '',
                  role: 'user',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } : null;
                set({ profile: basicProfile });
                
                // Try to create the profile if it doesn't exist
                if (error.message.includes("no rows")) {
                  supabase
                    .from("profiles")
                    .insert([basicProfile])
                    .then(({ error: insertError }) => {
                      if (insertError) {
                        console.error("Failed to create profile:", insertError);
                      } else {
                        console.log("Profile created successfully");
                      }
                    });
                }
              } else {
                set({ profile: data });
              }
            })
            .catch(error => {
              console.error("Failed to fetch profile:", error);
              set({ 
                error: new Error("Failed to fetch user profile"),
                profile: null
              });
            });
          */
        }
        break;
      case "SIGNED_OUT":
        set({ user: null, profile: null, error: null });
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
}));
