import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LoadingScreen } from './ui/LoadingScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuthStore();
  const location = useLocation();

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!user || error) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ 
          from: location.pathname,
          message: error ? error.message : 'Please log in to continue.' 
        }} 
        replace 
      />
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 