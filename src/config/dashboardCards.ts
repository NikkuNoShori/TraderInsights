import type {
  DashboardCard,
  DashboardCardType,
  DashboardConfig,
} from "../types/dashboard";
import { PlaybookCard } from "@/components/dashboard/PlaybookCard";
import { RecentTradesCard } from "@/components/dashboard/RecentTradesCard";
import type { Layout } from "react-grid-layout";
import {
  DEFAULT_DASHBOARD_LAYOUT,
  CARD_TYPES,
  type CardType,
} from "./dashboardTheme";

interface DashboardCardConfig extends DashboardCard {
  component?: React.ComponentType<any>;
  defaultSize?: {
    w: number;
    h: number;
  };
}

export const DASHBOARD_CARDS: Record<DashboardCardType, DashboardCardConfig> = {
  total_pnl: {
    type: "total_pnl",
    label: "Total P&L",
    description: "Total profit/loss across all trades",
  },
  win_rate: {
    type: "win_rate",
    label: "Win Rate",
    description: "Percentage of winning trades",
  },
  profit_factor: {
    type: "profit_factor",
    label: "Profit Factor",
    description: "Ratio of gross profit to gross loss",
  },
  total_trades: {
    type: "total_trades",
    label: "Total Trades",
    description: "Total number of completed trades",
  },
  active_trades: {
    type: "active_trades",
    label: "Active Trades",
    description: "Currently open positions",
  },
  average_win: {
    type: "average_win",
    label: "Average Win",
    description: "Average profit per winning trade",
  },
  average_loss: {
    type: "average_loss",
    label: "Average Loss",
    description: "Average loss per losing trade",
  },
  recent_trades: {
    type: "recent_trades",
    label: "Recent Trades",
    description: "List of most recent trades",
    component: RecentTradesCard,
  },
  playbook: {
    type: "playbook",
    label: "Playbook",
    description: "Trading strategy performance",
    component: PlaybookCard,
  },
  max_drawdown_pct: {
    type: "max_drawdown_pct",
    label: "Max Drawdown %",
    description: "Maximum percentage drawdown",
  },
  portfolio_value: {
    type: "portfolio_value",
    label: "Portfolio Value",
    description: "Total value of all positions and cash",
    defaultSize: { w: 2, h: 1 },
  },
  cash_balance: {
    type: "cash_balance",
    label: "Cash Balance",
    description: "Available cash in the account",
    defaultSize: { w: 2, h: 1 },
  },
  buying_power: {
    type: "buying_power",
    label: "Buying Power",
    description: "Total buying power available",
    defaultSize: { w: 2, h: 1 },
  },
  day_trading_status: {
    type: "day_trading_status",
    label: "Day Trading Status",
    description: "Current day trading status and restrictions",
    defaultSize: { w: 2, h: 1 },
  },
  positions_grid: {
    type: "positions_grid",
    label: "Positions",
    description: "Current open positions",
    defaultSize: { w: 4, h: 3 },
  },
  position_performance: {
    type: "position_performance",
    label: "Position Performance",
    description: "Performance metrics for current positions",
    defaultSize: { w: 4, h: 2 },
  },
  unrealized_pnl: {
    type: "unrealized_pnl",
    label: "Unrealized P&L",
    description: "Current unrealized profit and loss",
    defaultSize: { w: 2, h: 1 },
  },
  position_distribution: {
    type: "position_distribution",
    label: "Position Distribution",
    description: "Distribution of positions by sector/type",
    defaultSize: { w: 4, h: 2 },
  },
  cash_vs_invested: {
    type: "cash_vs_invested",
    label: "Cash vs Invested",
    description: "Comparison of cash and invested amounts",
    defaultSize: { w: 4, h: 2 },
  },
  buying_power_trend: {
    type: "buying_power_trend",
    label: "Buying Power Trend",
    description: "Historical buying power trend",
    defaultSize: { w: 4, h: 2 },
  },
  margin_usage: {
    type: "margin_usage",
    label: "Margin Usage",
    description: "Current margin usage and requirements",
    defaultSize: { w: 2, h: 1 },
  },
  recent_orders: {
    type: "recent_orders",
    label: "Recent Orders",
    description: "Most recent orders and their status",
    defaultSize: { w: 4, h: 2 },
  },
  order_status: {
    type: "order_status",
    label: "Order Status",
    description: "Distribution of order statuses",
    defaultSize: { w: 2, h: 1 },
  },
  pending_orders: {
    type: "pending_orders",
    label: "Pending Orders",
    description: "Currently pending orders",
    defaultSize: { w: 4, h: 2 },
  },
};

export function getDefaultDashboardConfig(): DashboardConfig {
  const defaultLayouts = CARD_TYPES.map((cardType: CardType) =>
    DEFAULT_DASHBOARD_LAYOUT.find((layout: Layout) => layout.i === cardType)
  ).filter((layout): layout is Layout => layout !== null);

  const now = new Date().toISOString();

  return {
    currentLayout: "default",
    layouts: [
      {
        id: "default",
        name: "Default Dashboard",
        layouts: defaultLayouts,
        enabledCards: [...CARD_TYPES],
        createdAt: now,
        updatedAt: now,
      },
    ],
    enabledCards: [...CARD_TYPES],
  };
}
