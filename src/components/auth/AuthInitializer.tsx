import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";

export function AuthInitializer() {
  const { setInitialized, handleAuthStateChange } = useAuthStore();

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthStateChange("SIGNED_IN", session);
      }
      setInitialized(true);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, setInitialized]);

  return null;
} 