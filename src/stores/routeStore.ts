import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define route types
export type RouteSection = "overview" | "market" | "future" | "account";

// Define the base path for all protected routes
export const BASE_PATH = "/app";

// Define route configuration
export const ROUTES = {
  // Overview section
  dashboard: `${BASE_PATH}/dashboard`,
  journal: `${BASE_PATH}/journal`,
  performance: `${BASE_PATH}/performance`,

  // Market section
  stocks: `${BASE_PATH}/stocks`,
  market: `${BASE_PATH}/market`,

  // Future features
  playbook: `${BASE_PATH}/playbook`,
  watchlist: `${BASE_PATH}/watchlist`,
  portfolios: `${BASE_PATH}/portfolios`,

  // Analysis/Performance section
  analysisPerformance: `${BASE_PATH}/analysis/performance`,
  analysisAllocation: `${BASE_PATH}/analysis/performance/allocation`,
  analysisCalendar: `${BASE_PATH}/analysis/performance/calendar`,

  // Account section
  settings: `${BASE_PATH}/settings`,
  profile: `${BASE_PATH}/settings/profile`,

  // Auth routes
  login: "/auth/login",
  requestReset: "/auth/request-reset",
  resetPassword: "/auth/reset-password",

  // Public routes
  landing: "/",
};

// Define the store interface
interface RouteState {
  currentRoute: string;
  previousRoute: string;
  setCurrentRoute: (route: string) => void;
  getRoute: (routeName: keyof typeof ROUTES) => string;
  isActive: (routeName: keyof typeof ROUTES) => boolean;
}

// Create the store
export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      currentRoute: ROUTES.dashboard,
      previousRoute: ROUTES.landing,

      setCurrentRoute: (route) => {
        set((state) => ({
          previousRoute: state.currentRoute,
          currentRoute: route,
        }));
      },

      getRoute: (routeName) => {
        return ROUTES[routeName];
      },

      isActive: (routeName) => {
        const currentRoute = get().currentRoute;
        const route = ROUTES[routeName];

        // Check if the current route starts with the given route
        // This handles nested routes (e.g., /app/journal/123 should match /app/journal)
        return (
          currentRoute === route ||
          (currentRoute.startsWith(route) &&
            (currentRoute.length === route.length ||
              currentRoute[route.length] === "/"))
        );
      },
    }),
    {
      name: "route-store",
      partialize: (state) => ({
        currentRoute: state.currentRoute,
        previousRoute: state.previousRoute,
      }),
    }
  )
);
