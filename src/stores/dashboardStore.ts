import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { DashboardState, DashboardProfile } from '../types/dashboard';
import { DEFAULT_PROFILE } from '../config/dashboardProfiles';

// Define the database row type to match the actual database schema
interface DashboardProfileRow {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  layout: any[];
  enabled_cards: string[];
  created_at: string;
  updated_at: string;
}

interface DashboardStore extends DashboardState {
  fetchProfiles: (userId: string) => Promise<void>;
  createProfile: (profile: Omit<DashboardProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProfile: (profileId: string, updates: Partial<DashboardProfile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  setCurrentProfile: (profileId: string) => void;
}

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  currentProfileId: '',
  profiles: [],
  isLoading: false,
  error: null,

  fetchProfiles: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('dashboard_profiles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Transform database rows to DashboardProfile type
      const profiles = (data as DashboardProfileRow[])?.map(profile => ({
        id: profile.id,
        userId: profile.user_id,
        name: profile.name,
        isDefault: profile.is_default,
        layout: profile.layout,
        enabledCards: profile.enabled_cards,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      })) || [];

      if (!data || data.length === 0) {
        const defaultProfile = {
          ...DEFAULT_PROFILE,
          userId,
        };
        await get().createProfile(defaultProfile);
        return;
      }

      set({ profiles, currentProfileId: profiles[0].id });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (profile) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_profiles')
        .insert([{
          user_id: profile.userId,
          name: profile.name,
          is_default: profile.isDefault,
          layout: profile.layout,
          enabled_cards: profile.enabledCards
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform database row to DashboardProfile type
      const newProfile = {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        isDefault: data.is_default,
        layout: data.layout,
        enabledCards: data.enabled_cards,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      const profiles = get().profiles;
      set({ profiles: [...profiles, newProfile] });
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileId, updates) => {
    try {
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
      if (updates.layout) updateData.layout = updates.layout;
      if (updates.enabledCards) updateData.enabled_cards = updates.enabledCards;

      const { error } = await supabase
        .from('dashboard_profiles')
        .update(updateData)
        .eq('id', profileId);

      if (error) throw error;

      const profiles = get().profiles.map(p => 
        p.id === profileId ? { ...p, ...updates } : p
      );
      set({ profiles });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  deleteProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('dashboard_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      set((state: DashboardState) => ({
        profiles: state.profiles.filter(p => p.id !== profileId),
        currentProfileId: state.currentProfileId === profileId
          ? state.profiles[0]?.id || ''
          : state.currentProfileId
      }));
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentProfile: (profileId: string) => {
    set({ currentProfileId: profileId });
  },
})); 