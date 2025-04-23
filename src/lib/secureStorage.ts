import { SnapTradeUser } from "./snaptrade/types";

/**
 * Secure storage service for handling sensitive data
 * This service provides a secure way to store and retrieve sensitive data
 * by using server-side storage with proper encryption
 */

// Types for secure storage
export interface SecureStorageConfig {
  encryptionKey: string;
  storagePath: string;
}

// Initialize secure storage with configuration
export class SecureStorage {
  private static instance: SecureStorage;
  private config: SecureStorageConfig;

  private constructor(config: SecureStorageConfig) {
    this.config = config;
  }

  public static getInstance(config: SecureStorageConfig): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage(config);
    }
    return SecureStorage.instance;
  }

  // User data management
  public async saveUser(user: SnapTradeUser): Promise<void> {
    try {
      const response = await fetch("/api/secure-storage/save-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        throw new Error("Failed to save user data");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }

  public async getUser(): Promise<SnapTradeUser | null> {
    try {
      const response = await fetch("/api/secure-storage/get-user", {
        method: "GET",
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        throw new Error("Failed to get user data");
      }

      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  public async clearUser(): Promise<void> {
    try {
      const response = await fetch("/api/secure-storage/clear-user", {
        method: "POST",
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        throw new Error("Failed to clear user data");
      }
    } catch (error) {
      console.error("Error clearing user data:", error);
      throw error;
    }
  }

  // Session management
  public async createSession(userId: string): Promise<string> {
    try {
      const response = await fetch("/api/secure-storage/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  public async validateSession(): Promise<boolean> {
    try {
      const response = await fetch("/api/secure-storage/validate-session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isValid;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  }

  public async clearSession(): Promise<void> {
    try {
      const response = await fetch("/api/secure-storage/clear-session", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to clear session");
      }
    } catch (error) {
      console.error("Error clearing session:", error);
      throw error;
    }
  }
}
