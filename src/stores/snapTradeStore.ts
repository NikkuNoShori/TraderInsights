import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface SnapTradeUserData {
  snapTradeUserId: string;
  snapTradeUserSecret: string;
  connectedBrokers: string[];
  lastSync?: string;
}

interface SnapTradeStore {
  userData: SnapTradeUserData | null;
  isLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  saveUserData: (data: SnapTradeUserData) => Promise<void>;
  clearUserData: () => Promise<void>;
}

export const useSnapTradeStore = create<SnapTradeStore>((set, get) => ({
  userData: null,
  isLoading: false,
  error: null,

  fetchUserData: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from("snaptrade_user_data")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        throw error;
      }

      set({ userData: data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch user data",
        isLoading: false,
      });
    }
  },

  saveUserData: async (data: SnapTradeUserData) => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase.from("snaptrade_user_data").upsert({
        user_id: user.id,
        ...data,
      });

      if (error) {
        throw error;
      }

      set({ userData: data, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to save user data",
        isLoading: false,
      });
    }
  },

  clearUserData: async () => {
    try {
      set({ isLoading: true, error: null });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("snaptrade_user_data")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      set({ userData: null, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to clear user data",
        isLoading: false,
      });
    }
  },
}));
