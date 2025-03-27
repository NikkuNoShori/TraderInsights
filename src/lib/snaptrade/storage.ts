/**
 * Storage adapter for SnapTrade integration.
 * This adapter provides a consistent interface for storage operations in both browser and Node.js environments.
 */

import { SnapTradeUser, SnapTradeConnection, SnapTradeAccount } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Determine if we're running in a browser or Node.js environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// In-memory storage for Node.js environment
const memoryStorage: Record<string, string> = {};

// File storage path for Node.js environment
const getStoragePath = () => {
  const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
  return path.join(tempDir, 'snaptrade-storage');
};

// Ensure storage directory exists
const ensureStorageDir = () => {
  if (!isBrowser) {
    const storagePath = getStoragePath();
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }
};

/**
 * Get an item from storage.
 * @param key Storage key
 * @returns Stored value or null if not found
 */
export const getItem = (key: string): string | null => {
  if (isBrowser) {
    return localStorage.getItem(key);
  } else {
    try {
      // First try memory storage
      if (memoryStorage[key]) {
        return memoryStorage[key];
      }
      
      // Then try file storage
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }
};

/**
 * Set an item in storage.
 * @param key Storage key
 * @param value Value to store
 */
export const setItem = (key: string, value: string): void => {
  if (isBrowser) {
    localStorage.setItem(key, value);
  } else {
    try {
      // Store in memory
      memoryStorage[key] = value;
      
      // Also store in file for persistence
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      fs.writeFileSync(filePath, value, 'utf8');
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }
};

/**
 * Remove an item from storage.
 * @param key Storage key
 */
export const removeItem = (key: string): void => {
  if (isBrowser) {
    localStorage.removeItem(key);
  } else {
    try {
      // Remove from memory
      delete memoryStorage[key];
      
      // Remove from file storage
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }
};

/**
 * Get an array from storage.
 * @param key Storage key
 * @returns Array of items or empty array if not found
 */
export const getArray = <T>(key: string): T[] => {
  const data = getItem(key);
  return data ? JSON.parse(data) : [];
};

/**
 * Get an object from storage.
 * @param key Storage key
 * @returns Object or null if not found
 */
export const getObject = <T>(key: string): T | null => {
  const data = getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Save an array to storage.
 * @param key Storage key
 * @param data Array to store
 */
export const saveArray = <T>(key: string, data: T[]): void => {
  setItem(key, JSON.stringify(data));
};

/**
 * Save an object to storage.
 * @param key Storage key
 * @param data Object to store
 */
export const saveObject = <T>(key: string, data: T): void => {
  setItem(key, JSON.stringify(data));
};

// Storage keys
export const STORAGE_KEYS = {
  USER: "snaptrade_user",
  CONNECTIONS: "snaptrade_connections",
  ACCOUNTS: "snaptrade_accounts",
  POSITIONS: "snaptrade_positions",
  ORDERS: "snaptrade_orders",
  BALANCES: "snaptrade_balances",
  LAST_SYNC: "snaptrade_last_sync",
} as const;

// Storage helper functions for specific data types
export const StorageHelpers = {
  // User data
  getUser: (): SnapTradeUser | null => getObject<SnapTradeUser>(STORAGE_KEYS.USER),
  saveUser: (user: SnapTradeUser): void => saveObject(STORAGE_KEYS.USER, user),
  clearUser: (): void => removeItem(STORAGE_KEYS.USER),
  
  // Connections
  getConnections: (): SnapTradeConnection[] => getArray<SnapTradeConnection>(STORAGE_KEYS.CONNECTIONS),
  saveConnections: (connections: SnapTradeConnection[]): void => saveArray(STORAGE_KEYS.CONNECTIONS, connections),
  clearConnections: (): void => removeItem(STORAGE_KEYS.CONNECTIONS),
  
  // Accounts
  getAccounts: (): SnapTradeAccount[] => getArray<SnapTradeAccount>(STORAGE_KEYS.ACCOUNTS),
  saveAccounts: (accounts: SnapTradeAccount[]): void => saveArray(STORAGE_KEYS.ACCOUNTS, accounts),
  clearAccounts: (): void => removeItem(STORAGE_KEYS.ACCOUNTS),
  
  // Last sync time
  getLastSyncTime: (): string | null => getItem(STORAGE_KEYS.LAST_SYNC),
  updateLastSyncTime: (): void => setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
  
  // Clear all data
  clearAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(removeItem);
  }
}; 
/**
 * Storage adapter for SnapTrade integration.
 * This adapter provides a consistent interface for storage operations in both browser and Node.js environments.
 */

import { SnapTradeUser, SnapTradeConnection, SnapTradeAccount } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Determine if we're running in a browser or Node.js environment
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

// In-memory storage for Node.js environment
const memoryStorage: Record<string, string> = {};

// File storage path for Node.js environment
const getStoragePath = () => {
  const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
  return path.join(tempDir, 'snaptrade-storage');
};

// Ensure storage directory exists
const ensureStorageDir = () => {
  if (!isBrowser) {
    const storagePath = getStoragePath();
    if (!fs.existsSync(storagePath)) {
      fs.mkdirSync(storagePath, { recursive: true });
    }
  }
};

/**
 * Get an item from storage.
 * @param key Storage key
 * @returns Stored value or null if not found
 */
export const getItem = (key: string): string | null => {
  if (isBrowser) {
    return localStorage.getItem(key);
  } else {
    try {
      // First try memory storage
      if (memoryStorage[key]) {
        return memoryStorage[key];
      }
      
      // Then try file storage
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return null;
    }
  }
};

/**
 * Set an item in storage.
 * @param key Storage key
 * @param value Value to store
 */
export const setItem = (key: string, value: string): void => {
  if (isBrowser) {
    localStorage.setItem(key, value);
  } else {
    try {
      // Store in memory
      memoryStorage[key] = value;
      
      // Also store in file for persistence
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      fs.writeFileSync(filePath, value, 'utf8');
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
    }
  }
};

/**
 * Remove an item from storage.
 * @param key Storage key
 */
export const removeItem = (key: string): void => {
  if (isBrowser) {
    localStorage.removeItem(key);
  } else {
    try {
      // Remove from memory
      delete memoryStorage[key];
      
      // Remove from file storage
      ensureStorageDir();
      const filePath = path.join(getStoragePath(), `${key}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
    }
  }
};

/**
 * Get an array from storage.
 * @param key Storage key
 * @returns Array of items or empty array if not found
 */
export const getArray = <T>(key: string): T[] => {
  const data = getItem(key);
  return data ? JSON.parse(data) : [];
};

/**
 * Get an object from storage.
 * @param key Storage key
 * @returns Object or null if not found
 */
export const getObject = <T>(key: string): T | null => {
  const data = getItem(key);
  return data ? JSON.parse(data) : null;
};

/**
 * Save an array to storage.
 * @param key Storage key
 * @param data Array to store
 */
export const saveArray = <T>(key: string, data: T[]): void => {
  setItem(key, JSON.stringify(data));
};

/**
 * Save an object to storage.
 * @param key Storage key
 * @param data Object to store
 */
export const saveObject = <T>(key: string, data: T): void => {
  setItem(key, JSON.stringify(data));
};

// Storage keys
export const STORAGE_KEYS = {
  USER: "snaptrade_user",
  CONNECTIONS: "snaptrade_connections",
  ACCOUNTS: "snaptrade_accounts",
  POSITIONS: "snaptrade_positions",
  ORDERS: "snaptrade_orders",
  BALANCES: "snaptrade_balances",
  LAST_SYNC: "snaptrade_last_sync",
} as const;

// Storage helper functions for specific data types
export const StorageHelpers = {
  // User data
  getUser: (): SnapTradeUser | null => getObject<SnapTradeUser>(STORAGE_KEYS.USER),
  saveUser: (user: SnapTradeUser): void => saveObject(STORAGE_KEYS.USER, user),
  clearUser: (): void => removeItem(STORAGE_KEYS.USER),
  
  // Connections
  getConnections: (): SnapTradeConnection[] => getArray<SnapTradeConnection>(STORAGE_KEYS.CONNECTIONS),
  saveConnections: (connections: SnapTradeConnection[]): void => saveArray(STORAGE_KEYS.CONNECTIONS, connections),
  clearConnections: (): void => removeItem(STORAGE_KEYS.CONNECTIONS),
  
  // Accounts
  getAccounts: (): SnapTradeAccount[] => getArray<SnapTradeAccount>(STORAGE_KEYS.ACCOUNTS),
  saveAccounts: (accounts: SnapTradeAccount[]): void => saveArray(STORAGE_KEYS.ACCOUNTS, accounts),
  clearAccounts: (): void => removeItem(STORAGE_KEYS.ACCOUNTS),
  
  // Last sync time
  getLastSyncTime: (): string | null => getItem(STORAGE_KEYS.LAST_SYNC),
  updateLastSyncTime: (): void => setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString()),
  
  // Clear all data
  clearAllData: (): void => {
    Object.values(STORAGE_KEYS).forEach(removeItem);
  }
}; 