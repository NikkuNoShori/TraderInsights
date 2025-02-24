import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layout } from "react-grid-layout";
import type { DashboardProfile } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";
import { config } from "@/config";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  DEFAULT_ENABLED_CARDS,
} from "../config/dashboardTheme";

interface DashboardState {
  currentProfileId: string;
  currentProfile: DashboardProfile | null;
  profiles: DashboardProfile[];
  layouts: Layout[];
  isEditing: boolean;
  isLoading: boolean;
  error: Error | null;
}

interface DashboardActions {
  setIsEditing: (editing: boolean) => void;
  fetchProfiles: (userId: string) => Promise<void>;
  createProfile: (
    profile: Omit<DashboardProfile, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProfile: (
    profileId: string,
    updates: Partial<DashboardProfile>,
  ) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profileId: string) => void;
  updateLayouts: (newLayouts: Layout[]) => void;
}

export const useDashboardStore = create<DashboardState & DashboardActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProfileId: "",
      currentProfile: null,
      profiles: [],
      layouts: DEFAULT_DASHBOARD_LAYOUT,
      isEditing: false,
      isLoading: false,
      error: null,

      // Actions
      setIsEditing: (editing) => set({ isEditing: editing }),

      fetchProfiles: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          if (!config.isProduction && userId === "dev-123") {
            // Mock data for development mode
            const mockProfile: DashboardProfile = {
              id: "dev-profile",
              userId: "dev-123",
              name: "Default Profile",
              isDefault: true,
              layout: DEFAULT_DASHBOARD_LAYOUT,
              enabledCards: DEFAULT_ENABLED_CARDS,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set({
              profiles: [mockProfile],
              currentProfileId: mockProfile.id,
              currentProfile: mockProfile,
              layouts: mockProfile.layout,
              isLoading: false,
            });
            return;
          }

          const { data, error } = await supabase
            .from("dashboard_profiles")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });

          if (error) throw error;

          const profiles = data || [];
          set({ profiles });

          if (profiles.length > 0) {
            const defaultProfile =
              profiles.find((p) => p.is_default) || profiles[0];
            set({
              currentProfileId: defaultProfile.id,
              currentProfile: defaultProfile,
              layouts: defaultProfile.layout || DEFAULT_DASHBOARD_LAYOUT,
            });
          }

          // Save layouts to localStorage
          if (userId) {
            localStorage.setItem(
              `dashboard-layout-${userId}`,
              JSON.stringify(get().layouts),
            );
          }
        } catch (error) {
          console.error("Error fetching profiles:", error);
          set({ error: error as Error });
        } finally {
          set({ isLoading: false });
        }
      },

      createProfile: async (profile) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("dashboard_profiles")
            .insert([
              {
                user_id: profile.userId,
                name: profile.name,
                is_default: profile.isDefault,
                layout: profile.layout || DEFAULT_DASHBOARD_LAYOUT,
                enabled_cards: profile.enabledCards || DEFAULT_ENABLED_CARDS,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          const profiles = get().profiles;
          set({
            profiles: [...profiles, data],
            isLoading: false,
          });

          if (data.is_default) {
            set({
              currentProfileId: data.id,
              currentProfile: data,
              layouts: data.layout || DEFAULT_DASHBOARD_LAYOUT,
            });
          }
        } catch (error) {
          console.error("Error creating profile:", error);
          set({ error: error as Error, isLoading: false });
          throw error;
        }
      },

      updateProfile: async (profileId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("dashboard_profiles")
            .update(updates)
            .eq("id", profileId)
            .select()
            .single();

          if (error) throw error;

          const profiles = get().profiles.map((p) =>
            p.id === profileId ? { ...p, ...data } : p,
          );

          set({ profiles, isLoading: false });

          if (get().currentProfileId === profileId) {
            set({
              currentProfile: data,
              layouts: data.layout || DEFAULT_DASHBOARD_LAYOUT,
            });
          }
        } catch (error) {
          console.error("Error updating profile:", error);
          set({ error: error as Error, isLoading: false });
          throw error;
        }
      },

      deleteProfile: async (profileId) => {
        set({ isLoading: true, error: null });
        try {
          const { error } = await supabase
            .from("dashboard_profiles")
            .delete()
            .eq("id", profileId);

          if (error) throw error;

          const profiles = get().profiles.filter((p) => p.id !== profileId);
          set({ profiles });

          if (get().currentProfileId === profileId) {
            const nextProfile = profiles[0];
            if (nextProfile) {
              set({
                currentProfileId: nextProfile.id,
                currentProfile: nextProfile,
                layouts: nextProfile.layout || DEFAULT_DASHBOARD_LAYOUT,
              });
            } else {
              set({
                currentProfileId: "",
                currentProfile: null,
                layouts: DEFAULT_DASHBOARD_LAYOUT,
              });
            }
          }
        } catch (error) {
          console.error("Error deleting profile:", error);
          set({ error: error as Error });
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentProfile: (profileId) => {
        const profile = get().profiles.find((p) => p.id === profileId);
        if (profile) {
          set({
            currentProfileId: profileId,
            currentProfile: profile,
            layouts: profile.layout || DEFAULT_DASHBOARD_LAYOUT,
          });
        }
      },

      updateLayouts: (newLayouts) => {
        set({ layouts: newLayouts });
        const userId = get().profiles[0]?.userId;
        if (userId) {
          localStorage.setItem(
            `dashboard-layout-${userId}`,
            JSON.stringify(newLayouts),
          );
        }
      },
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        currentProfileId: state.currentProfileId,
        layouts: state.layouts,
      }),
    },
  ),
);
