import type { User as SupabaseUser } from "@supabase/supabase-js";

export type UserRole = "admin" | "user" | "developer";

export interface User extends SupabaseUser {
  role: UserRole;
  permissions: string[];
  name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  username_changes_remaining: number;
  last_username_change?: string;
  role: UserRole;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}

export type Permission =
  | "dashboard.access"
  | "journal.access"
  | "settings.access"
  | "settings";

export interface UserPermissions {
  [key: string]: boolean;
}
