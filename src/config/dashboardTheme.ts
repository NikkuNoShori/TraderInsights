import type { Layout } from "react-grid-layout";

// Default layout for the dashboard
export const DEFAULT_DASHBOARD_LAYOUT: Layout[] = [
  { i: "total_pnl", x: 0, y: 0, w: 2, h: 1 },
  { i: "win_rate", x: 2, y: 0, w: 2, h: 1 },
  { i: "total_trades", x: 4, y: 0, w: 2, h: 1 },
  { i: "profit_factor", x: 0, y: 1, w: 2, h: 1 },
  { i: "active_trades", x: 2, y: 1, w: 2, h: 1 },
  { i: "average_win", x: 4, y: 1, w: 2, h: 1 },
  { i: "average_loss", x: 0, y: 2, w: 2, h: 1 },
  { i: "max_drawdown_pct", x: 2, y: 2, w: 2, h: 1 },
  { i: "recent_trades", x: 0, y: 3, w: 3, h: 2 },
  { i: "playbook", x: 3, y: 3, w: 3, h: 2 },
];

// Dashboard theme configuration using CSS variables
export const DASHBOARD_THEME = {
  card: {
    background: "var(--card)",
    backgroundHover: "var(--card-hover)",
    border: "var(--border)",
    borderHover: "var(--border-hover)",
    text: "var(--text)",
    textMuted: "var(--text-muted)",
  },
  chart: {
    grid: "var(--chart-grid)",
    text: "var(--chart-text)",
    profit: "var(--profit)",
    loss: "var(--loss)",
    neutral: "var(--neutral)",
  },
} as const;

// Types for the dashboard theme
export type DashboardTheme = typeof DASHBOARD_THEME;

// Card types
export const CARD_TYPES = [
  "total_pnl",
  "win_rate",
  "profit_factor",
  "total_trades",
  "active_trades",
  "average_win",
  "average_loss",
  "recent_trades",
  "playbook",
  "max_drawdown_pct",
] as const;

export type CardType = (typeof CARD_TYPES)[number];
