/**
 * Storage adapter for SnapTrade integration.
 * This adapter provides a consistent interface for storage operations in both browser and Node.js environments.
 */

import {
  SnapTradeUser,
  SnapTradeConnection,
  SnapTradeAccount,
  SnapTradeConfig,
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
  getUser: (): SnapTradeUser | null => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.USER);
    if (!data) return null;

    try {
      const user = JSON.parse(data);
      // Validate that the user object has the required properties
      if (!user.userId || !user.userSecret) {
        console.warn("Invalid SnapTrade user data in storage");
        return null;
      }
      return user as SnapTradeUser;
    } catch (error) {
      console.error("Error parsing SnapTrade user data:", error);
      return null;
    }
  },

  saveUser: (user: SnapTradeUser): void => {
    // Validate user object before saving
    if (!user.userId || !user.userSecret) {
      console.warn("Attempted to save invalid SnapTrade user data");
      return;
    }
    StorageHelpers.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  // Config data
  getConfig: (): SnapTradeConfig | null => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  },

  setConfig: (config: SnapTradeConfig): void => {
    StorageHelpers.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // Connections
  getConnections: (): SnapTradeConnection[] => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.CONNECTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveConnections: (connections: SnapTradeConnection[]): void => {
    StorageHelpers.setItem(
      STORAGE_KEYS.CONNECTIONS,
      JSON.stringify(connections)
    );
  },

  // Accounts
  getAccounts: (): SnapTradeAccount[] => {
    const data = StorageHelpers.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },

  saveAccounts: (accounts: SnapTradeAccount[]): void => {
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
  saveConnectionSession: (session: ConnectionSession): void => {
    const sessions = StorageHelpers.getConnectionSessions();
    sessions[session.brokerId] = session;
    StorageHelpers.setItem(
      STORAGE_KEYS.CONNECTION_SESSIONS,
      JSON.stringify(sessions)
    );
  },

  getConnectionSession: (brokerId: string): ConnectionSession | null => {
    const sessions = StorageHelpers.getConnectionSessions();
    return sessions[brokerId] || null;
  },

  getConnectionSessions: (): Record<string, ConnectionSession> => {
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