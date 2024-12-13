import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSupabase } from '../contexts/SupabaseContext';
import { LoadingScreen } from './ui/LoadingScreen';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useSupabase();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If there's an auth error, redirect to login
    if (error) {
      navigate('/login', { 
        state: { 
          from: location,
          error: error.message 
        },
        replace: true 
      });
    }
  }, [error, navigate, location]);

  // Show loading screen while checking auth
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location.pathname,
          message: 'Please log in to continue.' 
        }} 
        replace 
      />
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 