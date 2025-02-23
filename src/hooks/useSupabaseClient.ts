import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/authStore";

export function useSupabaseClient() {
  const { user } = useAuthStore();
  return { supabase, user };
}
