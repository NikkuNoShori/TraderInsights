import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import Login from "@/views/auth/Login";
import RequestPasswordReset from "@/views/auth/RequestPasswordReset";
import ResetPassword from "@/views/auth/ResetPassword";
import Dashboard from "@/views/Dashboard";
import Performance from "@/views/analysis/Performance";
import TradingJournal from "@/views/TradingJournal";
import Settings from "@/views/settings/Settings";

// Protected Route component
function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

// Auth Route component to handle authenticated users trying to access auth pages
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
}

// NotFound component
function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <a href="/" className="text-primary hover:underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout><Outlet /></Layout>,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "journal",
            element: <TradingJournal />,
          },
          {
            path: "performance",
            element: <Performance />,
          },
          {
            path: "settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <AuthRoute>
        <AuthLayout 
          title="Welcome to Trader Insights"
          subtitle="Your personal trading journal and analytics platform"
        >
          <Outlet />
        </AuthLayout>
      </AuthRoute>
    ),
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "reset-password",
        element: <RequestPasswordReset />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
