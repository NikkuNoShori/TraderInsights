import { useEffect, type ReactNode } from "@/lib/react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase";

export function StoreProvider({ children }: { children: ReactNode }) {
  const { handleAuthStateChange, setInitialized } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        setInitialized(true);
        return;
      }

      if (session) {
        handleAuthStateChange("SIGNED_IN", session);
      } else {
        handleAuthStateChange("SIGNED_OUT", null);
      }
      setInitialized(true);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      handleAuthStateChange(event, session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, setInitialized]);

  return children;
}
