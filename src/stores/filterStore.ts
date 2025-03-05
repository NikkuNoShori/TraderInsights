import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  TradeFilters,
  TradeType,
  TradeSide,
  TradeStatus,
} from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";

interface FilterState {
  filters: TradeFilters;
  sessionId: string;
  setFilters: (filters: Partial<TradeFilters>) => void;
  clearFilters: () => void;
  toggleBroker: (brokerId: string) => void;
  toggleSymbol: (symbol: string) => void;
  toggleType: (type: TradeType) => void;
  toggleSide: (side: TradeSide) => void;
  toggleStatus: (status: TradeStatus) => void;
  setDateRange: (range: [Date, Date] | undefined) => void;
  setPnLRange: (min: number | undefined, max: number | undefined) => void;
  setWinLoss: (value: "win" | "loss" | undefined) => void;
  setTimeframe: (timeframe: TimeframeOption) => void;
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
  timeframe: "1M",
};

// Generate a new session ID
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: { ...defaultFilters },
      sessionId: generateSessionId(),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
        })),

      clearFilters: () =>
        set({
          filters: { ...defaultFilters },
        }),

      toggleBroker: (brokerId) =>
        set((state) => {
          const brokers = state.filters.brokers || [];
          const newBrokers = brokers.includes(brokerId)
            ? brokers.filter((id) => id !== brokerId)
            : [...brokers, brokerId];

          return {
            filters: {
              ...state.filters,
              brokers: newBrokers,
            },
          };
        }),

      toggleSymbol: (symbol) =>
        set((state) => {
          const symbols = state.filters.symbols || [];
          const newSymbols = symbols.includes(symbol)
            ? symbols.filter((s) => s !== symbol)
            : [...symbols, symbol];

          return {
            filters: {
              ...state.filters,
              symbols: newSymbols,
            },
          };
        }),

      toggleType: (type) =>
        set((state) => {
          const types = state.filters.types || [];
          const newTypes = types.includes(type)
            ? types.filter((t) => t !== type)
            : [...types, type];

          return {
            filters: {
              ...state.filters,
              types: newTypes,
            },
          };
        }),

      toggleSide: (side) =>
        set((state) => {
          const sides = state.filters.sides || [];
          const newSides = sides.includes(side)
            ? sides.filter((s) => s !== side)
            : [...sides, side];

          return {
            filters: {
              ...state.filters,
              sides: newSides,
            },
          };
        }),

      toggleStatus: (status) =>
        set((state) => {
          const statuses = state.filters.status || [];
          const newStatuses = statuses.includes(status)
            ? statuses.filter((s) => s !== status)
            : [...statuses, status];

          return {
            filters: {
              ...state.filters,
              status: newStatuses,
            },
          };
        }),

      setDateRange: (range) =>
        set((state) => ({
          filters: {
            ...state.filters,
            dateRange: range,
          },
        })),

      setPnLRange: (min, max) =>
        set((state) => ({
          filters: {
            ...state.filters,
            minPnl: min,
            maxPnl: max,
          },
        })),

      setWinLoss: (value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            winLoss: value,
          },
        })),

      setTimeframe: (timeframe) =>
        set((state) => ({
          filters: {
            ...state.filters,
            timeframe,
          },
        })),
    }),
    {
      name: "trader-insights-filters",
      version: 4,
      partialize: (state) => ({
        filters: state.filters,
        sessionId: state.sessionId,
      }),
      onRehydrateStorage: () => (state) => {
        // Generate a new session ID when the page is loaded
        if (state) {
          state.sessionId = generateSessionId();
        }
      },
    }
  )
);
