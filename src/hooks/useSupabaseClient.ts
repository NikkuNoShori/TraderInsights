import { useSupabaseStore } from "@/stores/supabaseStore";
import { useAuthStore } from "@/stores/authStore";

export function useSupabaseClient() {
  const client = useSupabaseStore((state) => state.client);
  const user = useAuthStore((state) => state.user);

  return { supabase: client, user };
}
