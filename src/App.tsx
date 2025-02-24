import { useEffect } from "@/lib/react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useNavigation as useRouterNavigation,
  useNavigate,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthLayout } from "./components/auth/AuthLayout";
import LandingPage from "./views/LandingPage";
import Login from "./views/auth/Login";
import Dashboard from "./views/Dashboard";
import TradingJournal from "./views/TradingJournal/index";
import Watchlist from "./views/Watchlist";
import Performance from "./views/analysis/Performance";
import { ThemeProvider } from "./providers/ThemeProvider";
import { AuthGuard } from "./components/AuthGuard";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/globals.css";
import "./config/fontawesome";
import Settings from "./views/settings/Settings";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import Portfolios from "./views/Portfolios";
import { RouteErrorBoundary } from "./components/routing/RouteErrorBoundary";
import { RouteLoading } from "./components/routing/RouteLoading";
import RequestPasswordReset from "./views/auth/RequestPasswordReset";
import ResetPassword from "./views/auth/ResetPassword";
import { BarChart2, PieChart, Calendar } from "lucide-react";
import { StoreProvider } from "./providers/StoreProvider";
import { useNavigationStore } from "./stores/navigationStore";
import { PageHeader } from "./components/ui/PageHeader";
import { ReportingNav } from "./components/navigation/ReportingNav";
import SecurityMonitoring from "./views/admin/SecurityMonitoring";

console.log("[App] Starting application initialization");

// Create a wrapper component that handles loading states
function RouteWrapper({ children }: { children: React.ReactNode }) {
  const navigation = useRouterNavigation();
  const setIsNavigating = useNavigationStore((state) => state.setIsNavigating);

  useEffect(() => {
    setIsNavigating(navigation.state === "loading");
  }, [navigation.state, setIsNavigating]);

  if (navigation.state === "loading") {
    return <RouteLoading />;
  }

  return <>{children}</>;
}

// Update the router configuration
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <RouteWrapper>
          <LandingPage />
        </RouteWrapper>
      ),
    },
    {
      path: "/auth",
      element: (
        <RouteWrapper>
          <AuthLayout title="Login" subtitle="Welcome back">
            <Outlet />
          </AuthLayout>
        </RouteWrapper>
      ),
      children: [
        {
          path: "login",
          element: <Login />,
        },
        {
          path: "request-reset",
          element: <RequestPasswordReset />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },
      ],
    },
    {
      path: "/app",
      element: (
        <AuthGuard>
          <RouteWrapper>
            <Layout />
          </RouteWrapper>
        </AuthGuard>
      ),
      errorElement: <RouteErrorBoundary />,
      children: [
        {
          index: true,
          element: <Navigate to="/app/dashboard" replace />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: "journal",
          element: <TradingJournal />,
        },
        {
          path: "watchlist",
          element: <Watchlist />,
        },
        {
          path: "portfolios",
          element: <Portfolios />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: "analysis/performance",
          element: <Performance />,
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: "analysis/performance/allocation",
          element: (
            <div className="flex-grow p-4">
              <PageHeader
                title="Portfolio Allocation"
                subtitle="View your portfolio distribution and risk exposure"
              />
              <ReportingNav />
              <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto text-gray-400" />
                  <h2 className="mt-4 text-xl font-semibold">Coming Soon</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Portfolio allocation analysis is currently in development.
                  </p>
                </div>
              </div>
            </div>
          ),
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: "analysis/performance/calendar",
          element: (
            <div className="flex-grow p-4">
              <PageHeader
                title="Trading Calendar"
                subtitle="View your trading activity patterns and timing analysis"
              />
              <ReportingNav />
              <div className="flex items-center justify-center h-[calc(100vh-300px)]">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto text-gray-400" />
                  <h2 className="mt-4 text-xl font-semibold">Coming Soon</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Trading calendar and timing analysis is currently in
                    development.
                  </p>
                </div>
              </div>
            </div>
          ),
          errorElement: <RouteErrorBoundary />,
        },
        {
          path: "analysis/statistics",
          element: (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold">Coming Soon</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Advanced trading statistics and analytics are currently in
                  development.
                </p>
              </div>
            </div>
          ),
          errorElement: <RouteErrorBoundary />,
        },
      ],
    },
    {
      path: "/settings",
      element: (
        <AuthGuard>
          <RouteWrapper>
            <Layout />
          </RouteWrapper>
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/settings/profile" replace />,
        },
        {
          path: "profile",
          element: <Settings />,
        },
        {
          path: "security",
          element: <Settings />,
        },
        {
          path: "appearance",
          element: <Settings />,
        },
        {
          path: "notifications",
          element: <Settings />,
        },
      ],
    },
    {
      path: "/admin",
      element: (
        <AuthGuard>
          <RouteWrapper>
            <Layout />
          </RouteWrapper>
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <Navigate to="/admin/security" replace />,
        },
        {
          path: "security",
          element: <SecurityMonitoring />,
          errorElement: <RouteErrorBoundary />,
        },
      ],
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
    },
  },
);

console.log("[App] Router created successfully");

// Create a navigation progress bar component
function NavigationProgress() {
  const isNavigating = useNavigationStore((state) => state.isNavigating);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1">
      <div className="h-full bg-primary animate-progress" />
    </div>
  );
}

// Main App component
const App = () => {
  console.log("[App] Rendering App component");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
            <NavigationProgress />
            <Toaster position="top-right" />
          </ThemeProvider>
        </StoreProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
