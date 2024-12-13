import type { Layout } from 'react-grid-layout';
import type { DashboardCardType } from './dashboard';

export type UserRole = 'developer' | 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  username: string;
  username_changes_remaining: number;
  last_username_change: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  created_at: string;
  role: UserRole;
}

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  side: 'long' | 'short';
  entry_date: string;
  exit_date: string | null;
  pnl: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Dashboard {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  layouts: Layout[];
  enabled_cards: DashboardCardType[];
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      trades: {
        Row: Trade;
        Insert: Omit<Trade, 'created_at' | 'updated_at' | 'pnl'>;
        Update: Partial<Omit<Trade, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      dashboards: {
        Row: Dashboard;
        Insert: Omit<Dashboard, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Dashboard, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}