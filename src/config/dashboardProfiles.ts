import { DEFAULT_DASHBOARD_LAYOUT } from "./dashboardTheme";
import type { DashboardProfile } from "../types/dashboard";

export const DEFAULT_PROFILE: Omit<
  DashboardProfile,
  "id" | "userId" | "createdAt" | "updatedAt"
> = {
  name: "Default Layout",
  isDefault: true,
  layout: Object.values(DEFAULT_DASHBOARD_LAYOUT),
  enabledCards: ["total_pnl", "win_rate", "profit_factor", "recent_trades"],
};
