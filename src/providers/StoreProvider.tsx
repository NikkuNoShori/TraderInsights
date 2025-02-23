import { PropsWithChildren, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useDashboardStore } from '../stores/dashboardStore';
import { supabase } from '../lib/supabase';

export function StoreProvider({ children }: PropsWithChildren) {
  const handleAuthStateChange = useAuthStore(state => state.handleAuthStateChange);
  const setInitialized = useAuthStore(state => state.setInitialized);
  const fetchProfiles = useDashboardStore(state => state.fetchProfiles);
  const user = useAuthStore(state => state.user);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setInitialized(true);
          return;
        }

        if (session) {
          console.log('Found existing session:', session.user.id);
          await handleAuthStateChange('SIGNED_IN', session);
        } else {
          console.log('No existing session found');
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setInitialized(true);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      await handleAuthStateChange(event, session);
    });

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, setInitialized]);

  // Fetch dashboard profiles when user changes
  useEffect(() => {
    if (user?.id) {
      fetchProfiles(user.id);
    }
  }, [user?.id, fetchProfiles]);

  return <>{children}</>;
} 