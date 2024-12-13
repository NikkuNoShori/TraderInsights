import type { Layout } from 'react-grid-layout';

export type DashboardCardType = 
  | 'total_pnl'
  | 'win_rate'
  | 'profit_factor'
  | 'average_win'
  | 'average_loss'
  | 'active_trades'
  | 'total_trades'
  | 'recent_trades'
  | 'playbook'
  | 'max_drawdown_pct';

export interface DashboardCard {
  type: DashboardCardType;
  label: string;
  description: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  layouts: Layout[];
}

export interface DashboardConfig {
  enabledCards: DashboardCardType[];
  layouts: DashboardLayout[];
  currentLayout: string | null;
}

export type DashboardProfile = {
  id: string;
  name: string;
  isDefault: boolean;
  layout: Layout[];
  enabledCards: DashboardCardType[];
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type DashboardState = {
  currentProfileId: string;
  profiles: DashboardProfile[];
  isLoading: boolean;
  error: Error | null;
}; 