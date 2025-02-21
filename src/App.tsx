import React, { useCallback } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigation as useRouterNavigation, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthLayout } from './components/auth/AuthLayout';
import Login from './views/auth/Login';
import Dashboard from './views/Dashboard';
import TradingJournal from './views/TradingJournal/index';
import Watchlist from './views/Watchlist';
import Performance from './views/analysis/Performance';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthGuard } from './components/AuthGuard';        
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/globals.css';
import './config/fontawesome';
import Settings from './views/settings/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import Portfolios from './views/Portfolios';
import { RouteErrorBoundary } from './components/routing/RouteErrorBoundary';
import { RouteLoading } from './components/routing/RouteLoading';
import RequestPasswordReset from './views/auth/RequestPasswordReset';
import ResetPassword from './views/auth/ResetPassword';
import { BarChart2 } from 'lucide-react';

console.log('[App] Starting application initialization');  

// Create a wrapper component that handles loading states
function RouteWrapper({ children }: { children: React.ReactNode }) {
  const navigation = useRouterNavigation();
  
  if (navigation.state === "loading") {
    return <RouteLoading />;
  }

  return <>{children}</>;
}

// Create a wrapper component for auth changes
function AuthStateHandler() {
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigation();

  const handleAuthStateChange = useCallback((event: string, session: any) => {
    console.log('Auth state change:', event, session);
    
    switch (event) {
      case 'SIGNED_IN':
        navigate('/app/dashboard', { replace: true });
        break;
      case 'SIGNED_OUT':
        navigate('/auth/login', { replace: true });
        break;
      case 'USER_UPDATED':
        // Handle user update if needed
        break;
    }
  }, [navigate]);

  return (
    <SupabaseProvider 
      supabase={supabase} 
      onAuthChange={handleAuthStateChange}
    >
      <AuthProvider>
        <ThemeProvider>
          <DashboardProvider>
            <Outlet />
            <Toaster position="top-right" />
          </DashboardProvider>
        </ThemeProvider>
      </AuthProvider>
    </SupabaseProvider>
  );
}

// Update the router configuration
const router = createBrowserRouter([
  {
    element: <AuthStateHandler />,
    children: [
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
          },
          {
            path: 'analysis/statistics',
            element: <RouteWrapper>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 mx-auto text-gray-400" />
                  <h2 className="mt-4 text-xl font-semibold">Coming Soon</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Advanced trading statistics and analytics are currently in development.
                  </p>
                </div>
              </div>
            </RouteWrapper>,
            errorElement: <RouteErrorBoundary />
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
    ]
  }
], {
  future: {
    v7_normalizeFormMethod: true
  }
});

console.log('[App] Router created successfully');

// Main App component
const App = () => {
  console.log('[App] Rendering App component');

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <RouterProvider router={router} />
        </NavigationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
