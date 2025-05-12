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
import BrokerCallback from "./views/auth/BrokerCallback";
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
import BrokerDashboard from "./views/BrokerDashboard";
import { useResetFilters } from "./hooks/useResetFilters";
import { BrokerDashboard as BrokerConnectionManager } from "./components/broker/BrokerDashboard";
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
              <Route
                path="broker-callback"
                element={
                  <AuthLayout
                    title="Connecting to Broker"
                    subtitle="Please wait while we complete the connection..."
                  >
                    <BrokerCallback />
                  </AuthLayout>
                }
              />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Also add the broker-callback route outside of /auth to handle direct callbacks */}
            <Route path="/broker-callback" element={<BrokerCallback />} />

            {/* Protected routes - all under /app/* */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="journal" element={<TradingJournal />} />
              <Route path="journal/:id" element={<TradeDetails />} />
              <Route path="performance" element={<Performance />} />
              <Route path="broker-dashboard" element={<BrokerDashboard />} />
              <Route path="settings/*" element={<Settings />} />
              <Route path="broker-dashboard" element={<BrokerDashboard />} />
              <Route path="broker-connection" element={<BrokerConnectionManager />} />

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
