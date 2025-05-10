import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./views/Dashboard";
import TradingJournal from "./views/TradingJournal";
import TradeDetails from "./views/TradingJournal/TradeDetails";
import Settings from "./views/Settings";
import Login from "./views/auth/Login";
import RequestPasswordReset from "./views/auth/RequestPasswordReset";
import ResetPassword from "./views/auth/ResetPassword";
import { AuthGuard } from "./components/AuthGuard";
import { AuthLayout } from "./components/auth/AuthLayout";
import { AppProvider } from "./providers/AppProvider";
import { StoreProvider } from "./providers/StoreProvider";
import LandingPage from "./views/LandingPage";
import Performance from "./views/Performance";
import MarketData from "./views/MarketData";
import Stocks from "./views/Stocks";
import Playbook from "./views/Playbook";
import Portfolios from "./views/Portfolios";
import { useResetFilters } from "./hooks/useResetFilters";
import ContactPage from "./views/ContactUs";

function ProtectedLayout() {
  useResetFilters();
  
  return (
    <AuthGuard>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StoreProvider>
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            {/* Public routes */}
            <Route index element={<LandingPage />} />
            <Route path="contact" element={<ContactPage />} />

            {/* Auth routes */}
            <Route path="/auth" element={<Outlet />}>
              <Route
                path="login"
                element={
                  <AuthLayout
                    title="Welcome to TraderInsights"
                    subtitle="Sign in to your account"
                  >
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="request-reset"
                element={
                  <AuthLayout
                    title="Reset Password"
                    subtitle="Enter your email to reset your password"
                  >
                    <RequestPasswordReset />
                  </AuthLayout>
                }
              />
              <Route
                path="reset-password"
                element={
                  <AuthLayout
                    title="Set New Password"
                    subtitle="Enter your new password"
                  >
                    <ResetPassword />
                  </AuthLayout>
                }
              />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Protected routes - all under /app/* */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="journal" element={<TradingJournal />} />
              <Route path="journal/:id" element={<TradeDetails />} />
              <Route path="performance" element={<Performance />} />
              <Route path="settings/*" element={<Settings />} />

              {/* Feature Routes */}
              <Route path="playbook" element={<Playbook />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="market" element={<MarketData />} />
              <Route path="portfolios" element={<Portfolios />} />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </AppProvider>
  );
}
