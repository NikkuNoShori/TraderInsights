import type { DashboardCardType } from '../types/dashboard';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: React.ComponentType;
  requiresAuth: boolean;
  permissions?: string[];
  defaultCards?: DashboardCardType[];
}

export const ROUTES: Record<string, RouteConfig> = {
  dashboard: {
    path: "/dashboard",
    label: "Dashboard",
    requiresAuth: true,
    defaultCards: ["total_pnl", "win_rate", "profit_factor", "total_trades"],
  },
  journal: {
    path: "/app/journal",
    label: "Trading Journal",
    requiresAuth: true,
  },
  performance: {
    path: "/performance",
    label: "Performance",
    requiresAuth: true,
    defaultCards: ["win_rate", "profit_factor", "average_win", "average_loss"],
  },
  watchlist: {
    path: "/watchlist",
    label: "Watchlist",
    requiresAuth: true,
  },
}; 