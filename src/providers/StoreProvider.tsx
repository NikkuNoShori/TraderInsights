import { PropsWithChildren, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { supabase } from '../lib/supabase';

export function StoreProvider({ children }: PropsWithChildren) {
  const handleAuthStateChange = useAuthStore(state => state.handleAuthStateChange);
  const fetchProfiles = useDashboardStore(state => state.fetchProfiles);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error checking session:', error);
        return;
      }
      if (session) {
        handleAuthStateChange('SIGNED_IN', session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Fetch dashboard profiles when user changes
  useEffect(() => {
    if (user) {
      fetchProfiles(user.id);
    }
  }, [user, fetchProfiles]);

  return <>{children}</>;
} 