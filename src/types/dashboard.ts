import type { Layout } from "react-grid-layout";

export type DashboardCardType =
  | "total_pnl"
  | "win_rate"
  | "profit_factor"
  | "average_win"
  | "average_loss"
  | "active_trades"
  | "total_trades"
  | "recent_trades"
  | "playbook"
  | "max_drawdown_pct"
  // Broker Account Cards
  | "portfolio_value"
  | "cash_balance"
  | "buying_power"
  | "day_trading_status"
  // Position Cards
  | "positions_grid"
  | "position_performance"
  | "unrealized_pnl"
  | "position_distribution"
  // Balance Cards
  | "cash_vs_invested"
  | "buying_power_trend"
  | "margin_usage"
  // Order Cards
  | "recent_orders"
  | "order_status"
  | "pending_orders";

export interface DashboardCard {
  type: DashboardCardType;
  label: string;
  description: string;
}

export interface DashboardLayout {
  id: string;
  name: string;
  layouts: Layout[];
  enabledCards: DashboardCardType[];
  createdAt: string;
  updatedAt: string;
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
