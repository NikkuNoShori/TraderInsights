import { Request, Response } from "express";
import { supabase } from "../../lib/supabase";
import { encrypt, decrypt } from "../../lib/encryption";

// Session configuration
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_COOKIE_NAME = "trader_insights_session";
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: SESSION_DURATION,
};

export const secureStorage = {
  // Session management
  createSession: async (userId: string, res: Response): Promise<string> => {
    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + SESSION_DURATION).toISOString();

    // Store session in Supabase
    const { error } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: userId,
      expires_at: expires,
    });

    if (error) {
      console.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }

    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
    return sessionId;
  },

  validateSession: async (req: Request): Promise<string | null> => {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionId) return null;

    // Get session from Supabase
    const { data: session, error } = await supabase
      .from("sessions")
      .select("user_id, expires_at")
      .eq("id", sessionId)
      .single();

    if (error || !session) return null;

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from("sessions").delete().eq("id", sessionId);
      return null;
    }

    return session.user_id;
  },

  clearSession: async (req: Request, res: Response): Promise<void> => {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    if (sessionId) {
      await supabase.from("sessions").delete().eq("id", sessionId);
    }
    res.clearCookie(SESSION_COOKIE_NAME);
  },

  // Secure data storage
  saveUserData: async (userId: string, data: any): Promise<void> => {
    const encryptedData = await encrypt(JSON.stringify(data));

    const { error } = await supabase.from("user_data").upsert({
      user_id: userId,
      encrypted_data: encryptedData,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving user data:", error);
      throw new Error("Failed to save user data");
    }
  },

  getUserData: async (userId: string): Promise<any | null> => {
    const { data, error } = await supabase
      .from("user_data")
      .select("encrypted_data")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    try {
      const decryptedData = await decrypt(data.encrypted_data);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Error decrypting user data:", error);
      return null;
    }
  },

  clearUserData: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from("user_data")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error clearing user data:", error);
      throw new Error("Failed to clear user data");
    }
  },

  // Cleanup expired sessions
  cleanupExpiredSessions: async (): Promise<void> => {
    const { error } = await supabase
      .from("sessions")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  },
};

// Run cleanup every hour
setInterval(() => secureStorage.cleanupExpiredSessions(), 60 * 60 * 1000);
