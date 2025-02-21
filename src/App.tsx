import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigation as useRouterNavigation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthLayout } from './components/auth/AuthLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import TradingJournal from './pages/TradingJournal';
import Watchlist from './pages/Watchlist';
import Performance from './pages/analysis/Performance';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthGuard } from './components/AuthGuard';        
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/globals.css';
import './config/fontawesome';
import Settings from './pages/settings/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Portfolios from './pages/Portfolios';
import { RouteErrorBoundary } from './components/routing/RouteErrorBoundary';
import { RouteLoading } from './components/routing/RouteLoading';
import RequestPasswordReset from './pages/auth/RequestPasswordReset';
import ResetPassword from './pages/auth/ResetPassword';

console.log('[App] Starting application initialization');  

// Create a wrapper component that handles loading states
function RouteWrapper({ children }: { children: React.ReactNode }) {
  const navigation = useRouterNavigation();
  
  if (navigation.state === "loading") {
    return <RouteLoading />;
  }

  return <>{children}</>;
}

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: '/auth',
    element: <AuthLayout title="Login" subtitle="Welcome back"><Outlet /></AuthLayout>,
    children: [
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'request-reset',
        element: <RequestPasswordReset />
      },
      {
        path: 'reset-password',
        element: <ResetPassword />
      }
    ]
  },
  {
    path: '/app',
    element: <AuthGuard><Layout /></AuthGuard>,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <RouteWrapper><Dashboard /></RouteWrapper>,
        errorElement: <RouteErrorBoundary />,
        loader: async () => {
          await new Promise(r => setTimeout(r, 500));
          return null;
        }
      },
      {
        path: 'journal',
        element: <TradingJournal />
      },
      {
        path: 'watchlist',
        element: <Watchlist />
      },
      {
        path: 'portfolios',
        element: <RouteWrapper><Portfolios /></RouteWrapper>,
        errorElement: <RouteErrorBoundary />,
        loader: async () => {
          await new Promise(r => setTimeout(r, 500));
          return null;
        }
      },
      {
        path: 'analysis/performance',
        element: <RouteWrapper><Performance /></RouteWrapper>,
        errorElement: <RouteErrorBoundary />,
        loader: async () => {
          await new Promise(r => setTimeout(r, 500));
          return null;
        }
      }
    ]
  },
  {
    path: '/settings',
    element: <AuthGuard><Layout /></AuthGuard>,
    children: [
      {
        index: true,
        element: <Navigate to="/settings/profile" replace />
      },
      {
        path: 'profile',
        element: <Settings />
      },
      {
        path: 'security',
        element: <Settings />
      },
      {
        path: 'appearance',
        element: <Settings />
      },
      {
        path: 'notifications',
        element: <Settings />
      }
    ]
  }
]);

console.log('[App] Router created successfully');

// Create a wrapper component for auth changes
const AppContent = () => {
  const { setIsNavigating } = useNavigation();

  const handleAuthChange = async (event: string, user: any) => {
    setIsNavigating(true);
    try {
      switch (event) {
        case 'SIGNED_IN':
          await router.navigate('/app/dashboard');
          break;
        case 'SIGNED_OUT':
          await router.navigate('/auth/login');
          break;
        case 'PASSWORD_RECOVERY':
          await router.navigate('/auth/reset-password');
          break;
      }
    } finally {
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  return (
    <DashboardProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </DashboardProvider>
  );
};

// Main App component
const App = () => {
  console.log('[App] Rendering App component');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <SupabaseProvider supabase={supabase} onAuthChange={(event, user) => {
            console.log('Auth change:', event, user);
          }}>
            <AuthProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </AuthProvider>
          </SupabaseProvider>
        </NavigationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
