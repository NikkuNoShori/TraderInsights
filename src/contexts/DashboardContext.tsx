import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Layout } from 'react-grid-layout';
import { useSupabase } from './SupabaseContext';
import type { DashboardProfile } from '../types/dashboard';
import { DEFAULT_LAYOUTS, DEFAULT_ENABLED_CARDS } from '../config/dashboardLayouts';

interface DashboardContextType {
  currentProfile: DashboardProfile | null;
  profiles: DashboardProfile[];
  layouts: Layout[];
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  createProfile: (name: string) => Promise<void>;
  updateProfile: (id: string, updates: Partial<DashboardProfile>) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  updateLayouts: (newLayouts: Layout[]) => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { supabase, user } = useSupabase();
  const [profiles, setProfiles] = useState<DashboardProfile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<DashboardProfile | null>(null);
  const [layouts, setLayouts] = useState<Layout[]>(DEFAULT_LAYOUTS);
  const [isEditing, setIsEditing] = useState(false);

  // Load saved layout from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedLayout = localStorage.getItem(`dashboard-layout-${user.id}`);
      if (savedLayout) {
        setLayouts(JSON.parse(savedLayout));
      }
    }
  }, [user]);

  // Save layout changes to localStorage
  const handleLayoutChange = useCallback((newLayouts: Layout[]) => {
    if (user) {
      setLayouts(newLayouts);
      localStorage.setItem(`dashboard-layout-${user.id}`, JSON.stringify(newLayouts));
    }
  }, [user]);

  const fetchProfiles = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dashboard_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching dashboard profiles:', error);
      return;
    }

    setProfiles(data);
    if (data.length > 0) {
      const defaultProfile = data.find(p => p.is_default) || data[0];
      setCurrentProfile(defaultProfile);
      setLayouts(defaultProfile.layout);
    }
  }, [user, supabase]);

  // Fetch profiles on mount
  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user, fetchProfiles]);

  const createProfile = async (name: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('dashboard_profiles')
      .insert([{
        name,
        user_id: user.id,
        layout: DEFAULT_LAYOUTS,
        enabled_cards: DEFAULT_ENABLED_CARDS,
        is_default: profiles.length === 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating dashboard profile:', error);
      return;
    }

    setProfiles([...profiles, data]);
    if (data.is_default) {
      setCurrentProfile(data);
      setLayouts(data.layout);
    }
  };

  const updateProfile = async (id: string, updates: Partial<DashboardProfile>) => {
    const { data, error } = await supabase
      .from('dashboard_profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard profile:', error);
      return;
    }

    setProfiles(profiles.map(p => p.id === id ? data : p));
    if (currentProfile?.id === id) {
      setCurrentProfile(data);
      if (updates.layout) {
        setLayouts(updates.layout);
      }
    }
  };

  const switchProfile = async (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;

    setCurrentProfile(profile);
    setLayouts(profile.layout);
  };

  const deleteProfile = async (id: string) => {
    const { error } = await supabase
      .from('dashboard_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dashboard profile:', error);
      return;
    }

    setProfiles(profiles.filter(p => p.id !== id));
    if (currentProfile?.id === id) {
      const nextProfile = profiles.find(p => p.id !== id);
      if (nextProfile) {
        setCurrentProfile(nextProfile);
        setLayouts(nextProfile.layout);
      } else {
        setCurrentProfile(null);
        setLayouts(DEFAULT_LAYOUTS);
      }
    }
  };

  return (
    <DashboardContext.Provider value={{
      currentProfile,
      profiles,
      layouts,
      isEditing,
      setIsEditing,
      createProfile,
      updateProfile,
      switchProfile,
      deleteProfile,
      updateLayouts: handleLayoutChange
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}; 