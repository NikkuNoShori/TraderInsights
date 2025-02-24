import { useAuthStore } from "@/stores/authStore";

/**
 * Hook to access auth state and actions
 * This is kept for backward compatibility and to provide a cleaner API
 */
export function useAuth() {
  return useAuthStore();
}
