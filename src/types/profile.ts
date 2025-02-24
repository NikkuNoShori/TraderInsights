import type { UserRole } from "./auth";

export interface Profile {
  id: string;
  email: string;
  username: string;
  username_changes_remaining: number;
  last_username_change: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
