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
import ComingSoon from "./views/ComingSoon";
import Playbook from "./views/Playbook";
import { useResetFilters } from "./hooks/useResetFilters";
import { BrokerDashboard } from "./components/broker/BrokerDashboard";
import { SnapTradeTest } from "./components/test/SnapTradeTest";
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
            <Route path="/auth">
              <Route path="login" element={<Login />} />
              <Route path="request-reset" element={<RequestPasswordReset />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Protected routes */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="journal" element={<TradingJournal />} />
              <Route path="journal/:id" element={<TradeDetails />} />
              <Route path="performance" element={<Performance />} />
              <Route path="broker-dashboard" element={<BrokerDashboard />} />
              <Route path="settings/*" element={<Settings />} />
              <Route path="snaptrade-test" element={<SnapTradeTest />} />

              {/* Coming Soon Features */}
              <Route path="playbook" element={<ComingSoon />} />
              <Route path="stocks" element={<ComingSoon />} />
              <Route path="market" element={<ComingSoon />} />
              <Route path="watchlist" element={<ComingSoon />} />
              <Route path="portfolios" element={<ComingSoon />} />
            </Route>

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </StoreProvider>
    </AppProvider>
  );
}
