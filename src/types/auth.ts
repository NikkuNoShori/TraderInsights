import type { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'user' | 'manager';

export interface User extends SupabaseUser {
  role: UserRole;
  permissions: string[];
  name?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  role: UserRole;
  username?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
}

export type Permission = 
  | 'dashboard.access'
  | 'journal.access'
  | 'screener.access'
  | 'settings.access'
  | 'settings';

export interface UserPermissions {
  [key: string]: boolean;
}