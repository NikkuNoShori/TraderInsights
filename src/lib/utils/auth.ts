import { supabase } from '../supabase';
import type { Profile } from '../../types/database';
import type { UserPermissions } from '../../types/auth';

// Token Management
export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

export const validateToken = async (token: string): Promise<boolean> => {
  const currentToken = await getAuthToken();
  return currentToken === token;
};

// Profile Management
export const fetchProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

// Permissions Management
export async function fetchPermissions(_userId: string): Promise<UserPermissions> {
  try {
    // TODO: Implement actual permissions fetching from database
    return {
      "dashboard.access": true,
      "journal.access": true,
      "screener.access": true
    };
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return {};
  }
}

// Session Management
export const clearDeveloperMode = () => {
  localStorage.removeItem("developer-mode");
  sessionStorage.removeItem("dev-session");
  sessionStorage.clear();
  // Clear all auth-related data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("sb-") || key.includes("supabase")) {
      localStorage.removeItem(key);
    }
  });
  // Clear session storage
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith("sb-") || key.includes("supabase")) {
      sessionStorage.removeItem(key);
    }
  });
};

export const handleSignOut = async (signOut: () => Promise<void>) => {
  try {
    clearDeveloperMode();
    await signOut();
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during sign out:", error);
    window.location.href = "/login";
  }
};