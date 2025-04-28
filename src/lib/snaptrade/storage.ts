/**
 * Storage adapter for SnapTrade integration.
 * This adapter provides a consistent interface for storage operations in both browser and Node.js environments.
 */

import {
  SnapTradeUser,
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradeConfig,
  SnapTradeError,
  SnapTradeErrorCode,
} from "./types";

// Determine if we're running in a browser or Node.js environment
const isBrowser =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

// In-memory storage for Node.js environment
const memoryStorage: Record<string, string> = {};

// Storage keys
export const STORAGE_KEYS = {
  USER: "snaptrade_user",
  CONNECTIONS: "snaptrade_connections",
  ACCOUNTS: "snaptrade_accounts",
  LAST_SYNC: "snaptrade_last_sync",
  BALANCES: "snaptrade_balances",
  CONFIG: "snaptrade_config",
  CONNECTION_SESSION: "snaptrade_connection_session",
  CONNECTION_SESSIONS: "snaptrade_connection_sessions",
} as const;

// Define the connection session type
interface ConnectionSession {
  sessionId: string;
  userId: string;
  userSecret: string;
  brokerId: string;
  redirectUrl: string;
  createdAt: number;
  status: "pending" | "completed" | "failed";
  authorizationId?: string;
  error?: string;
}

// Storage helpers
export const StorageHelpers = {
  getItem: (key: string): string | null => {
    if (isBrowser) {
      return localStorage.getItem(key);
    }
    return memoryStorage[key] || null;
  },

  setItem: (key: string, value: string): void => {
    if (isBrowser) {
      localStorage.setItem(key, value);
    } else {
      memoryStorage[key] = value;
    }
  },

  removeItem: (key: string): void => {
    if (isBrowser) {
      localStorage.removeItem(key);
    } else {
      delete memoryStorage[key];
    }
  },

  clearAll: (): void => {
    if (isBrowser) {
      localStorage.clear();
    } else {
      Object.keys(memoryStorage).forEach((key) => {
        delete memoryStorage[key];
      });
    }
  },

  // User data
  getUser: (): { userId: string; userSecret: string } | null => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.USER);
    if (!data) return null;

    try {
      const user = JSON.parse(data);
      // Validate that the user object has the required properties
      if (!user.userId || !user.userSecret) {
        console.warn("Invalid SnapTrade user data in storage");
        return null;
      }
      return user;
    } catch (error) {
      console.error("Error parsing SnapTrade user data:", error);
      return null;
    }
  },

  saveUser: (user: { userId: string; userSecret: string }): void => {
    // Validate user object before saving
    if (!user.userId || !user.userSecret) {
      console.warn("Attempted to save invalid SnapTrade user data");
      return;
    }
    StorageHelpers.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Config data
  getConfig: (): any => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  },

  setConfig: (config: any): void => {
    StorageHelpers.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // Connections
  getConnections: (): any[] => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.CONNECTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveConnections: (connections: any[]): void => {
    StorageHelpers.setItem(
      STORAGE_KEYS.CONNECTIONS,
      JSON.stringify(connections)
    );
  },

  // Accounts
  getAccounts: (): any[] => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  saveAccounts: (accounts: any[]): void => {
    StorageHelpers.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // Last sync time
  getLastSync: (): number | null => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.LAST_SYNC);
    return data ? parseInt(data, 10) : null;
  },

  saveLastSync: (timestamp: number): void => {
    StorageHelpers.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
  },

  // Clear all SnapTrade data
  clearAllSnapTradeData: (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      StorageHelpers.removeItem(key);
    });
  },

  // Connection session management
  saveConnectionSession: (session: any): void => {
    const sessions = StorageHelpers.getConnectionSessions();
    sessions[session.brokerId] = session;
    StorageHelpers.setItem(
      STORAGE_KEYS.CONNECTION_SESSIONS,
      JSON.stringify(sessions)
    );
  },

  getConnectionSession: (brokerId: string): any => {
    const sessions = StorageHelpers.getConnectionSessions();
    return sessions[brokerId] || null;
  },

  getConnectionSessions: (): Record<string, any> => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.CONNECTION_SESSIONS);
    return data ? JSON.parse(data) : {};
  },

  clearConnectionSession: (brokerId: string): void => {
    const sessions = StorageHelpers.getConnectionSessions();
    delete sessions[brokerId];
    StorageHelpers.setItem(
      STORAGE_KEYS.CONNECTION_SESSIONS,
      JSON.stringify(sessions)
    );
  },
};

// Secure storage is only available in browser environment
export const secureStorage = isBrowser
  ? {
      storage: window.localStorage,
      encryptionKey: process.env.NEXT_PUBLIC_SNAPTRADE_ENCRYPTION_KEY || "",

      encrypt: function (data: string): string {
        if (!this.encryptionKey) {
          throw new SnapTradeError(
            "Encryption key not found",
            SnapTradeErrorCode.API_ERROR
          );
        }
        return data
          .split("")
          .map((char, i) =>
            String.fromCharCode(
              char.charCodeAt(0) ^
                this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
            )
          )
          .join("");
      },

      decrypt: function (data: string): string {
        return this.encrypt(data);
      },

      set: function (key: string, value: any): void {
        try {
          const encryptedValue = this.encrypt(JSON.stringify(value));
          this.storage.setItem(`snaptrade_${key}`, encryptedValue);
        } catch (error) {
          throw new SnapTradeError(
            `Failed to store data: ${error}`,
            SnapTradeErrorCode.API_ERROR
          );
        }
      },

      get: function (key: string): any {
        try {
          const encryptedValue = this.storage.getItem(`snaptrade_${key}`);
          if (!encryptedValue) return null;
          const decryptedValue = this.decrypt(encryptedValue);
          return JSON.parse(decryptedValue);
        } catch (error) {
          throw new SnapTradeError(
            `Failed to retrieve data: ${error}`,
            SnapTradeErrorCode.API_ERROR
          );
        }
      },

      remove: function (key: string): void {
        try {
          this.storage.removeItem(`snaptrade_${key}`);
        } catch (error) {
          throw new SnapTradeError(
            `Failed to remove data: ${error}`,
            SnapTradeErrorCode.API_ERROR
          );
        }
      },

      clear: function (): void {
        try {
          Object.keys(this.storage)
            .filter((key) => key.startsWith("snaptrade_"))
            .forEach((key) => this.storage.removeItem(key));
        } catch (error) {
          throw new SnapTradeError(
            `Failed to clear storage: ${error}`,
            SnapTradeErrorCode.API_ERROR
          );
        }
      },
    }
  : null;

// Type definitions for stored data
export interface StoredCredentials {
  userId: string;
  userSecret: string;
  createdAt: number;
}

export interface StoredSession {
  sessionId: string;
  userId: string;
  userSecret: string;
  brokerId: string;
  redirectUrl: string;
  createdAt: number;
  status: "pending" | "completed" | "failed";
}

// Helper functions for common operations
export const storageHelpers = {
  getCredentials: () => {
    if (!secureStorage) return null;
    return secureStorage.get("credentials");
  },
  setCredentials: (credentials: any) => {
    if (!secureStorage) return;
    secureStorage.set("credentials", credentials);
  },
  clearCredentials: () => {
    if (!secureStorage) return;
    secureStorage.remove("credentials");
  },
  getSession: () => {
    if (!secureStorage) return null;
    return secureStorage.get("session");
  },
  setSession: (session: any) => {
    if (!secureStorage) return;
    secureStorage.set("session", session);
  },
  clearSession: () => {
    if (!secureStorage) return;
    secureStorage.remove("session");
  },
  clearAll: () => {
    if (!secureStorage) return;
    secureStorage.clear();
  },
}; 