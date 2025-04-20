import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DebugCategory =
  | "broker"
  | "api"
  | "auth"
  | "theme"
  | "performance"
  | "state"
  | "all";

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
        set((state) => ({
          isDebugMode: !state.isDebugMode,
          // Reset to default categories when enabling debug mode
          enabledCategories: !state.isDebugMode ? ["broker"] : [],
        })),

      toggleCategory: (category) =>
        set((state) => {
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

      setLogLevel: (level) => set({ minLogLevel: level }),

      toggleDebugPanel: () =>
        set((state) => ({
          showDebugPanel: !state.showDebugPanel,
        })),

      updateBrokerDebug: (settings) =>
        set((state) => ({
          brokerDebug: { ...state.brokerDebug, ...settings },
        })),

      updateApiDebug: (settings) =>
        set((state) => ({
          apiDebug: { ...state.apiDebug, ...settings },
        })),

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
