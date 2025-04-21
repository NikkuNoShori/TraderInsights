import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DebugCategory =
  | "main"
  | "broker"
  | "api"
  | "auth"
  | "theme"
  | "performance"
  | "state"
  | "all"
  | "config"
  | "supabase"
  | "navigation";

export type DebugLevel = "info" | "warn" | "error" | "debug";

interface DebugSettings {
  isDebugMode: boolean;
  enabledCategories: DebugCategory[];
  minLogLevel: DebugLevel;
  showDebugPanel: boolean;
  brokerDebug: {
    showMissingBrokers: boolean;
    showBrokerDetails: boolean;
    showConnectionStatus: boolean;
  };
  apiDebug: {
    showRequests: boolean;
    showResponses: boolean;
    showErrors: boolean;
  };
  brokerState: {
    isInitialized: boolean;
    brokers: any[];
    loadingBrokers: boolean;
    brokerError: string | null;
    missingBrokers: string[];
    connectionStatus?: {
      isConnected: boolean;
      connectionCount: number;
      lastSyncTime?: number;
    };
  };
  // Store previous settings when debug mode is off
  previousSettings?: {
    enabledCategories: DebugCategory[];
    minLogLevel: DebugLevel;
    showDebugPanel: boolean;
    brokerDebug: DebugSettings["brokerDebug"];
    apiDebug: DebugSettings["apiDebug"];
  };
}

interface DebugStore extends DebugSettings {
  toggleDebugMode: () => void;
  toggleCategory: (category: DebugCategory) => void;
  setLogLevel: (level: DebugLevel) => void;
  toggleDebugPanel: () => void;
  updateBrokerDebug: (settings: Partial<DebugStore["brokerDebug"]>) => void;
  updateApiDebug: (settings: Partial<DebugStore["apiDebug"]>) => void;
  setDebugState: (state: Partial<DebugStore["brokerState"]>) => void;
  isCategoryEnabled: (category: DebugCategory) => boolean;
  shouldLog: (category: DebugCategory, level: DebugLevel) => boolean;
}

const defaultSettings: DebugSettings = {
  isDebugMode: process.env.NODE_ENV === "development",
  enabledCategories: ["broker"],
  minLogLevel: "info",
  showDebugPanel: false,
  brokerDebug: {
    showMissingBrokers: true,
    showBrokerDetails: true,
    showConnectionStatus: true,
  },
  apiDebug: {
    showRequests: false,
    showResponses: false,
    showErrors: true,
  },
  brokerState: {
    isInitialized: false,
    brokers: [],
    loadingBrokers: false,
    brokerError: null,
    missingBrokers: [],
  },
};

export const useDebugStore = create<DebugStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      toggleDebugMode: () =>
        set((state) => {
          if (state.isDebugMode) {
            // Turning debug mode off - store current settings and reset to defaults
            return {
              isDebugMode: false,
              previousSettings: {
                enabledCategories: state.enabledCategories,
                minLogLevel: state.minLogLevel,
                showDebugPanel: state.showDebugPanel,
                brokerDebug: state.brokerDebug,
                apiDebug: state.apiDebug,
              },
              enabledCategories: [],
              minLogLevel: "info",
              showDebugPanel: false,
              brokerDebug: defaultSettings.brokerDebug,
              apiDebug: defaultSettings.apiDebug,
            };
          } else {
            // Turning debug mode on - restore previous settings if available
            const previous = state.previousSettings;
            return {
              isDebugMode: true,
              enabledCategories: previous?.enabledCategories || ["broker"],
              minLogLevel: previous?.minLogLevel || "info",
              showDebugPanel: previous?.showDebugPanel || false,
              brokerDebug: previous?.brokerDebug || defaultSettings.brokerDebug,
              apiDebug: previous?.apiDebug || defaultSettings.apiDebug,
              previousSettings: undefined,
            };
          }
        }),

      toggleCategory: (category) =>
        set((state) => {
          if (!state.isDebugMode) return state;

          if (category === "all") {
            return {
              enabledCategories:
                state.enabledCategories.length === 0
                  ? ["broker", "api", "auth", "theme", "performance", "state"]
                  : [],
            };
          }

          const newCategories = state.enabledCategories.includes(category)
            ? state.enabledCategories.filter((c) => c !== category)
            : [...state.enabledCategories, category];

          return { enabledCategories: newCategories };
        }),

      setLogLevel: (level) =>
        set((state) => {
          if (!state.isDebugMode) return state;
          return { minLogLevel: level };
        }),

      toggleDebugPanel: () =>
        set((state) => {
          if (!state.isDebugMode) return state;
          return {
            showDebugPanel: !state.showDebugPanel,
          };
        }),

      updateBrokerDebug: (settings) =>
        set((state) => {
          if (!state.isDebugMode) return state;
          return {
            brokerDebug: { ...state.brokerDebug, ...settings },
          };
        }),

      updateApiDebug: (settings) =>
        set((state) => {
          if (!state.isDebugMode) return state;
          return {
            apiDebug: { ...state.apiDebug, ...settings },
          };
        }),

      setDebugState: (state) =>
        set((prev) => ({
          brokerState: { ...prev.brokerState, ...state },
        })),

      isCategoryEnabled: (category) => {
        const state = get();
        return (
          state.isDebugMode &&
          (state.enabledCategories.includes("all") ||
            state.enabledCategories.includes(category))
        );
      },

      shouldLog: (category, level) => {
        const state = get();
        if (!state.isDebugMode) return false;

        const levelPriority = {
          debug: 0,
          info: 1,
          warn: 2,
          error: 3,
        };

        const minLevelPriority = levelPriority[state.minLogLevel];
        const currentLevelPriority = levelPriority[level];

        return (
          state.isCategoryEnabled(category) &&
          currentLevelPriority >= minLevelPriority
        );
      },
    }),
    {
      name: "debug-settings",
      // Only persist in development
      partialize: (state) =>
        process.env.NODE_ENV === "development" ? state : {},
    }
  )
);

// Helper function to create debug loggers
export const createDebugLogger = (category: DebugCategory) => {
  return {
    debug: (...args: any[]) => {
      if (useDebugStore.getState().shouldLog(category, "debug")) {
        console.debug(`[${category}]`, ...args);
      }
    },
    info: (...args: any[]) => {
      if (useDebugStore.getState().shouldLog(category, "info")) {
        console.info(`[${category}]`, ...args);
      }
    },
    warn: (...args: any[]) => {
      if (useDebugStore.getState().shouldLog(category, "warn")) {
        console.warn(`[${category}]`, ...args);
      }
    },
    error: (...args: any[]) => {
      if (useDebugStore.getState().shouldLog(category, "error")) {
        console.error(`[${category}]`, ...args);
      }
    },
  };
};

export interface DebugLogger {
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  lastConfig?: any; // Allow any type for lastConfig
}
