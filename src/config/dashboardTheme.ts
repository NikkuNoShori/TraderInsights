import type { Layout } from "react-grid-layout";
import type { DashboardCardType } from "../types/dashboard";

// Default enabled cards
export const DEFAULT_ENABLED_CARDS: DashboardCardType[] = [
  "total_pnl",
  "win_rate",
  "profit_factor",
  "recent_trades",
  "playbook",
  "max_drawdown_pct",
];

// Default layout configuration
export const DEFAULT_DASHBOARD_LAYOUT: Layout[] = [
  { i: "total-pnl", x: 0, y: 0, w: 2, h: 1 },
  { i: "win-rate", x: 2, y: 0, w: 2, h: 1 },
  { i: "profit-factor", x: 4, y: 0, w: 2, h: 1 },
  { i: "recent-trades", x: 0, y: 1, w: 4, h: 2 },
  { i: "playbook", x: 4, y: 1, w: 2, h: 2 },
  { i: "max-drawdown-pct", x: 0, y: 3, w: 2, h: 1 },
];

// Dashboard theme configuration
export const DASHBOARD_THEME = {
  style: {
    border: true,
    shadow: "shadow-sm",
    borderRadius: "0.75rem",
    transition: "all 200ms ease",
  },
  cards: {
    minWidth: 250,
    minHeight: 150,
    padding: "1rem",
  },
  responsive: {
    baseWidth: 300,
    baseHeight: 200,
    scaleDuration: 200,
  },
};
