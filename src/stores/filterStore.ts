import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  TradeFilters,
  TradeType,
  TradeSide,
  TradeStatus,
} from "@/types/trade";

export type FilterSection = "overview" | "journal" | "performance";

interface FilterState {
  filters: Record<FilterSection, TradeFilters>;
  activeSection: FilterSection;
  sessionId: string;
  setActiveSection: (section: FilterSection) => void;
  setFilters: (filters: Partial<TradeFilters>) => void;
  clearFilters: (section?: FilterSection) => void;
  clearAllFilters: () => void;
  toggleBroker: (brokerId: string) => void;
  toggleSymbol: (symbol: string) => void;
  toggleType: (type: TradeType) => void;
  toggleSide: (side: TradeSide) => void;
  toggleStatus: (status: TradeStatus) => void;
  setDateRange: (range: [Date, Date] | undefined) => void;
  setPnLRange: (min: number | undefined, max: number | undefined) => void;
  setWinLoss: (value: "win" | "loss" | undefined) => void;
}

const defaultFilters: TradeFilters = {
  brokers: [],
  dateRange: undefined,
  symbols: [],
  types: [],
  sides: [],
  status: [],
  minPnl: undefined,
  maxPnl: undefined,
  setupTypes: [],
  strategies: [],
  winLoss: undefined,
};

// Generate a new session ID
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      // Initialize with default filters for each section
      filters: {
        overview: { ...defaultFilters },
        journal: { ...defaultFilters },
        performance: { ...defaultFilters },
      },
      activeSection: "journal",
      sessionId: generateSessionId(),

      setActiveSection: (section) => set({ activeSection: section }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [state.activeSection]: {
              ...state.filters[state.activeSection],
              ...newFilters,
            },
          },
        })),

      clearFilters: (section) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [section || state.activeSection]: { ...defaultFilters },
          },
        })),

      clearAllFilters: () =>
        set({
          filters: {
            overview: { ...defaultFilters },
            journal: { ...defaultFilters },
            performance: { ...defaultFilters },
          },
        }),

      toggleBroker: (brokerId) =>
        set((state) => {
          const currentFilters = state.filters[state.activeSection];
          const brokers = currentFilters.brokers || [];
          const newBrokers = brokers.includes(brokerId)
            ? brokers.filter((id) => id !== brokerId)
            : [...brokers, brokerId];

          return {
            filters: {
              ...state.filters,
              [state.activeSection]: {
                ...currentFilters,
                brokers: newBrokers,
              },
            },
          };
        }),

      toggleSymbol: (symbol) =>
        set((state) => {
          const currentFilters = state.filters[state.activeSection];
          const symbols = currentFilters.symbols || [];
          const newSymbols = symbols.includes(symbol)
            ? symbols.filter((s) => s !== symbol)
            : [...symbols, symbol];

          return {
            filters: {
              ...state.filters,
              [state.activeSection]: {
                ...currentFilters,
                symbols: newSymbols,
              },
            },
          };
        }),

      toggleType: (type) =>
        set((state) => {
          const currentFilters = state.filters[state.activeSection];
          const types = currentFilters.types || [];
          const newTypes = types.includes(type)
            ? types.filter((t) => t !== type)
            : [...types, type];

          return {
            filters: {
              ...state.filters,
              [state.activeSection]: {
                ...currentFilters,
                types: newTypes,
              },
            },
          };
        }),

      toggleSide: (side) =>
        set((state) => {
          const currentFilters = state.filters[state.activeSection];
          const sides = currentFilters.sides || [];
          const newSides = sides.includes(side)
            ? sides.filter((s) => s !== side)
            : [...sides, side];

          return {
            filters: {
              ...state.filters,
              [state.activeSection]: {
                ...currentFilters,
                sides: newSides,
              },
            },
          };
        }),

      toggleStatus: (status) =>
        set((state) => {
          const currentFilters = state.filters[state.activeSection];
          const statuses = currentFilters.status || [];
          const newStatuses = statuses.includes(status)
            ? statuses.filter((s) => s !== status)
            : [...statuses, status];

          return {
            filters: {
              ...state.filters,
              [state.activeSection]: {
                ...currentFilters,
                status: newStatuses,
              },
            },
          };
        }),

      setDateRange: (range) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [state.activeSection]: {
              ...state.filters[state.activeSection],
              dateRange: range,
            },
          },
        })),

      setPnLRange: (min, max) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [state.activeSection]: {
              ...state.filters[state.activeSection],
              minPnl: min,
              maxPnl: max,
            },
          },
        })),

      setWinLoss: (value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [state.activeSection]: {
              ...state.filters[state.activeSection],
              winLoss: value,
            },
          },
        })),
    }),
    {
      name: "trader-insights-filters",
      version: 2,
      partialize: (state) => ({
        filters: state.filters,
        activeSection: state.activeSection,
        sessionId: state.sessionId,
      }),
      onRehydrateStorage: () => (state) => {
        // Generate a new session ID when the page is loaded
        if (state) {
          state.sessionId = generateSessionId();
        }
      },
    },
  ),
);
