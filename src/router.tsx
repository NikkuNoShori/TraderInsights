import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Outlet } from "react-router-dom";
import Login from "@/views/auth/Login";
import RequestPasswordReset from "@/views/auth/RequestPasswordReset";
import ResetPassword from "@/views/auth/ResetPassword";
import Dashboard from "@/views/Dashboard";
import Performance from "@/views/analysis/Performance";
import TradingJournal from "@/views/TradingJournal";
import Settings from "@/views/settings/Settings";
import { ProtectedRoute, AuthRoute, NotFound } from "@/routes";

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
