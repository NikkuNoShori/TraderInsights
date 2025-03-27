import type { DashboardCardType } from "@/types/dashboard";

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
    path: "/app/dashboard",
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
    path: "/app/performance",
    label: "Performance",
    requiresAuth: true,
    defaultCards: ["win_rate", "profit_factor", "average_win", "average_loss"],
  },
  watchlist: {
    path: "/app/watchlist",
    label: "Watchlist",
    requiresAuth: true,
  },
  stocks: {
    path: "/app/stocks",
    label: "Stocks",
    requiresAuth: true,
  },
  market: {
    path: "/app/market",
    label: "Market Data",
    requiresAuth: true,
  },
  settings: {
    path: "/app/settings",
    label: "Settings",
    requiresAuth: true,
  },
  playbook: {
    path: "/app/playbook",
    label: "Playbook",
    requiresAuth: true,
  },
  portfolios: {
    path: "/app/portfolios",
    label: "Portfolios",
    requiresAuth: true,
  }
};
