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

  // Fetch profiles on mount
  useEffect(() => {
    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const fetchProfiles = async () => {
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
  };

  const createProfile = async (name: string) => {
    if (!user) return;

    const newProfile: Partial<DashboardProfile> = {
      name,
      userId: user.id,
      isDefault: profiles.length === 0,
      layout: DEFAULT_LAYOUTS,
      enabledCards: DEFAULT_ENABLED_CARDS,
    };

    const { data, error } = await supabase
      .from('dashboard_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (error) throw error;
    setProfiles(prev => [...prev, data]);
    if (newProfile.isDefault) {
      setCurrentProfile(data);
      setLayouts(data.layout);
    }
  };

  // ... implement other methods (updateProfile, switchProfile, deleteProfile)

  return (
    <DashboardContext.Provider value={{
      currentProfile,
      profiles,
      layouts,
      isEditing,
      setIsEditing,
      createProfile,
      updateProfile: async () => {}, // TODO: Implement updateProfile
      switchProfile: async () => {}, // TODO: Implement switchProfile
      deleteProfile: async () => {}, // TODO: Implement deleteProfile
      updateLayouts: handleLayoutChange,
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