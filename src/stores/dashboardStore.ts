import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Layout } from "react-grid-layout";
import type { DashboardProfile, DashboardCardType } from "@/types/dashboard";
import { supabase } from "@/lib/supabase";
import { config } from "@/config";
import { DEFAULT_DASHBOARD_LAYOUT } from "../config/dashboardTheme";

export type CardType =
  | "total_pnl"
  | "win_rate"
  | "profit_factor"
  | "average_win"
  | "average_loss"
  | "total_trades"
  | "max_drawdown_pct"
  | "recent_trades"
  | "playbook"
  | "active_trades";

export interface CardConfig {
  id: CardType;
  title: string;
  description: string;
  section: "dashboard" | "journal";
  defaultEnabled: boolean;
}

export const CARD_CONFIGS: Record<CardType, CardConfig> = {
  total_pnl: {
    id: "total_pnl",
    title: "Total P&L",
    description: "Total profit/loss across all trades",
    section: "dashboard",
    defaultEnabled: true,
  },
  win_rate: {
    id: "win_rate",
    title: "Win Rate",
    description: "Percentage of winning trades",
    section: "dashboard",
    defaultEnabled: true,
  },
  profit_factor: {
    id: "profit_factor",
    title: "Profit Factor",
    description: "Ratio of gross profit to gross loss",
    section: "dashboard",
    defaultEnabled: true,
  },
  average_win: {
    id: "average_win",
    title: "Average Win",
    description: "Average profit per winning trade",
    section: "dashboard",
    defaultEnabled: true,
  },
  average_loss: {
    id: "average_loss",
    title: "Average Loss",
    description: "Average loss per losing trade",
    section: "dashboard",
    defaultEnabled: true,
  },
  active_trades: {
    id: "active_trades",
    title: "Active Trades",
    description: "Currently open trades",
    section: "dashboard",
    defaultEnabled: true,
  },
  total_trades: {
    id: "total_trades",
    title: "Total Trades",
    description: "Total number of trades",
    section: "dashboard",
    defaultEnabled: true,
  },
  recent_trades: {
    id: "recent_trades",
    title: "Recent Trades",
    description: "Most recent trades",
    section: "dashboard",
    defaultEnabled: true,
  },
  playbook: {
    id: "playbook",
    title: "Playbook",
    description: "Trading strategy playbook",
    section: "dashboard",
    defaultEnabled: true,
  },
  max_drawdown_pct: {
    id: "max_drawdown_pct",
    title: "Max Drawdown",
    description: "Maximum drawdown percentage",
    section: "dashboard",
    defaultEnabled: true,
  },
};

// Default enabled cards for each section
export const DEFAULT_ENABLED_CARDS_BY_SECTION = {
  dashboard: Object.values(CARD_CONFIGS)
    .filter((card) => card.section === "dashboard" && card.defaultEnabled)
    .map((card) => card.id),
  journal: Object.values(CARD_CONFIGS)
    .filter((card) => card.section === "journal" && card.defaultEnabled)
    .map((card) => card.id),
} as const;

interface DashboardState {
  currentProfileId: string;
  currentProfile: DashboardProfile | null;
  profiles: DashboardProfile[];
  layouts: Layout[];
  isEditing: boolean;
  isLoading: boolean;
  error: Error | null;
  enabledCards: {
    dashboard: CardType[];
    journal: CardType[];
  };
  toggleCard: (section: "dashboard" | "journal", cardType: CardType) => void;
  resetCards: (section: "dashboard" | "journal") => void;
}

interface DashboardActions {
  setIsEditing: (editing: boolean) => void;
  fetchProfiles: (userId: string) => Promise<void>;
  createProfile: (
    profile: Omit<DashboardProfile, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateProfile: (
    profileId: string,
    updates: Partial<DashboardProfile>
  ) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profileId: string) => void;
  updateLayouts: (newLayouts: Layout[]) => void;
}

const DEFAULT_ENABLED_CARDS: Record<"dashboard" | "journal", CardType[]> = {
  dashboard: [
    "total_pnl",
    "win_rate",
    "profit_factor",
    "average_win",
    "average_loss",
    "total_trades",
    "active_trades",
    "recent_trades",
  ],
  journal: [
    "total_pnl",
    "win_rate",
    "profit_factor",
    "playbook",
    "recent_trades",
  ],
};

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
      enabledCards: DEFAULT_ENABLED_CARDS,

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
              enabledCards: DEFAULT_ENABLED_CARDS_BY_SECTION.dashboard,
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
              JSON.stringify(get().layouts)
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
                enabled_cards:
                  profile.enabledCards ||
                  DEFAULT_ENABLED_CARDS_BY_SECTION.dashboard,
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
            p.id === profileId ? { ...p, ...data } : p
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
            JSON.stringify(newLayouts)
          );
        }
      },

      toggleCard: (section, cardType) =>
        set((state) => {
          const currentCards = state.enabledCards[section];
          const newCards = currentCards.includes(cardType)
            ? currentCards.filter((c) => c !== cardType)
            : [...currentCards, cardType];

          return {
            enabledCards: {
              ...state.enabledCards,
              [section]: newCards,
            },
          };
        }),

      resetCards: (section) =>
        set((state) => ({
          enabledCards: {
            ...state.enabledCards,
            [section]: Object.values(CARD_CONFIGS)
              .filter((card) => card.section === section && card.defaultEnabled)
              .map((card) => card.id),
          },
        })),
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        currentProfileId: state.currentProfileId,
        layouts: state.layouts,
        enabledCards: state.enabledCards,
      }),
    }
  )
);
