import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoginPage from "@/views/Auth/LoginPage";
import RegisterPage from "@/views/Auth/RegisterPage";
import DashboardPage from "@/views/Dashboard";
import TradingJournal from "@/views/TradingJournal";
import TradeDetails from "@/views/TradingJournal/TradeDetails";
import SettingsPage from "@/views/Settings";
import NotFoundPage from "@/views/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <DashboardPage />,
      },
      {
        path: "journal",
        element: <TradingJournal />,
      },
      {
        path: "journal/trades/:tradeId",
        element: <TradeDetails />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
