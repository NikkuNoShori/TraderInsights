import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const APP_NAME = 'Trading Insights';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/journal': 'Trading Journal',
  '/watchlist': 'Watchlist',
  '/portfolios': 'Portfolios',
  '/analysis/performance': 'Performance Analysis',
  '/analysis/analytics': 'Analytics',
  '/settings/profile': 'Profile Settings',
  '/settings/appearance': 'Appearance Settings',
  '/settings/notifications': 'Notification Settings',
  '/login': 'Login',
};

export function usePageTitle() {
  const location = useLocation();

  useEffect(() => {
    const routeTitle = routeTitles[location.pathname] || 'Page Not Found';
    document.title = `${APP_NAME} | ${routeTitle}`;

    return () => {
      document.title = APP_NAME;
    };
  }, [location.pathname]);
} 