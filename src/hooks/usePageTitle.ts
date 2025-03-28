import { useEffect } from "@/lib/react";
import { useLocation } from "react-router-dom";

const APP_NAME = "Trading Insights";

const routeTitles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/journal": "Trading Journal",
  "/app/watchlist": "Watchlist",
  "/app/portfolios": "Portfolios",
  "/app/performance": "Performance Analysis",
  "/app/stocks": "Stocks",
  "/app/market": "Market Data",
  "/app/settings/profile": "Profile Settings",
  "/app/settings/appearance": "Appearance Settings",
  "/app/settings/notifications": "Notification Settings",
  "/app/settings/brokers": "Broker Settings",
  "/app/playbook": "Playbook",
  "/auth/login": "Login",
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const routeTitle = routeTitles[location.pathname] || "Page Not Found";
    document.title = `${APP_NAME} | ${routeTitle}`;

    return () => {
      document.title = APP_NAME;
    };
  }, [location.pathname]);
}
