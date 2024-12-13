import type { PropsWithChildren } from 'react';
import { createContext, useContext, useState, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types/database';
import type { UserPermissions } from '../types/auth';
import { config } from '../config/index';
import { supabase } from '../lib/supabase';
import { fetchProfile, fetchPermissions } from '../lib/utils/auth';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  permissions: UserPermissions;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loginAsDeveloper: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({});

  const signIn = async (_email: string, _password: string) => {
    try {
      if (config.isProduction) {
        const { data: response, error } = await supabase.auth.signInWithPassword({
          email: _email,
          password: _password
        });
        if (error) throw error;
        
        setUser(response.user);
        const profile = await fetchProfile(response.user.id);
        setProfile(profile);
        const userPermissions = await fetchPermissions(response.user.id);
        setPermissions(userPermissions);
      } else {
        // Local Sign in. We are bypassing supabase auth for now
        loginAsDeveloper();
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const loginAsDeveloper = async () => {
    try {
      // Set mock user data
      const mockUser = {
        id: 'dev-123',
        email: 'developer@example.com',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString()
      } as User;

      // Set mock profile data
      const mockProfile: Profile = {
        id: 'dev-123',
        email: 'developer@example.com',
        username: 'developer',
        username_changes_remaining: 3,
        last_username_change: null,
        first_name: 'Dev',
        last_name: 'User',
        date_of_birth: null,
        created_at: new Date().toISOString(),
        role: 'developer'
      };

      setUser(mockUser);
      setProfile(mockProfile);
      setPermissions({
        'dashboard.access': true,
        'journal.access': true,
        'screener.access': true
      });

    } catch (error) {
      console.error('Developer login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setPermissions({});
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');
      // const { data: updatedProfile, error } = await supabase
      //   .from('profiles')
      //   .update(data)
      //   .eq('id', user.id)
      //   .single();
      // if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = useMemo(() => ({
    user,
    profile,
    permissions,
    signIn,
    signOut,
    loginAsDeveloper,
    updateProfile
  }), [user, profile, permissions]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}