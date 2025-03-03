import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "./useSupabaseClient";
import {
  Trade,
  createTrade,
  type TradeType,
  type TradeSide,
  type TradeStatus,
  type OptionDetails,
} from "../types/trade";
import { config } from "@/config";

interface RawTradeData {
  id: string;
  user_id: string;
  broker_id?: string;
  date: string;
  time: string;
  timestamp: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  direction: TradeSide;
  quantity: number;
  price: number;
  total: number;
  entry_date: string;
  entry_time: string;
  entry_timestamp: string;
  entry_price: number;
  exit_date?: string;
  exit_time?: string;
  exit_timestamp?: string;
  exit_price?: number;
  pnl?: number;
  status: TradeStatus;
  notes?: string;
  setup_type?: string;
  strategy?: string;
  risk_reward?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_amount?: number;
  fees?: number;
  tags?: string[];
  option_details?: OptionDetails;
  created_at: string;
  updated_at: string;
}

export const MOCK_TRADES: Trade[] = [
  createTrade({
    id: "dev-trade-1",
    user_id: "dev-123",
    broker_id: "webull",
    date: "2024-03-15",
    time: "09:30:00",
    timestamp: "2024-03-15T09:30:00Z",
    symbol: "AAPL",
    type: "stock",
    side: "Long",
    quantity: 100,
    price: 150,
    total: 15000,
    entry_date: "2024-03-15",
    entry_time: "09:30:00",
    entry_timestamp: "2024-03-15T09:30:00Z",
    entry_price: 150,
    exit_price: 155,
    exit_date: "2024-03-15",
    exit_time: "16:00:00",
    exit_timestamp: "2024-03-15T16:00:00Z",
    pnl: 500,
    status: "closed",
    created_at: "2024-03-15T09:30:00Z",
    updated_at: "2024-03-15T16:00:00Z",
  }),
  createTrade({
    id: "dev-trade-2",
    user_id: "dev-123",
    broker_id: "webull",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    symbol: "TSLA",
    type: "stock",
    side: "Long",
    quantity: 50,
    price: 200.0,
    total: 10000.0,
    entry_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    entry_time: new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    entry_timestamp: new Date(Date.now() - 86400000).toISOString(),
    entry_price: 200.0,
    exit_price: 210.0,
    pnl: 500.0,
    status: "closed",
    notes: "Another mock trade",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  }),
  // Add more diverse mock trades
  createTrade({
    id: "dev-trade-3",
    user_id: "dev-123",
    broker_id: "webull",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    time: new Date(Date.now() - 172800000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    symbol: "MSFT",
    type: "stock",
    side: "Short",
    quantity: 75,
    price: 300.0,
    total: 22500.0,
    entry_date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    entry_time: new Date(Date.now() - 172800000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    entry_timestamp: new Date(Date.now() - 172800000).toISOString(),
    entry_price: 300.0,
    exit_price: 290.0,
    pnl: 750.0,
    status: "closed",
    notes: "Short trade example",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  }),
  createTrade({
    id: "dev-trade-4",
    user_id: "dev-123",
    broker_id: "webull",
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    time: new Date(Date.now() - 259200000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    symbol: "AMD",
    type: "stock",
    side: "Long",
    quantity: 200,
    price: 90.0,
    total: 18000.0,
    entry_date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    entry_time: new Date(Date.now() - 259200000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    entry_timestamp: new Date(Date.now() - 259200000).toISOString(),
    entry_price: 90.0,
    exit_price: 85.0,
    pnl: -1000.0,
    status: "closed",
    notes: "Loss trade example",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  }),
  createTrade({
    id: "dev-trade-5",
    user_id: "dev-123",
    broker_id: "webull",
    date: new Date(Date.now() - 345600000).toISOString().split("T")[0],
    time: new Date(Date.now() - 345600000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    symbol: "NVDA",
    type: "stock",
    side: "Long",
    quantity: 30,
    price: 400.0,
    total: 12000.0,
    entry_date: new Date(Date.now() - 345600000).toISOString().split("T")[0],
    entry_time: new Date(Date.now() - 345600000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    entry_timestamp: new Date(Date.now() - 345600000).toISOString(),
    entry_price: 400.0,
    exit_price: 420.0,
    pnl: 600.0,
    status: "closed",
    notes: "Small position size trade",
    created_at: new Date(Date.now() - 345600000).toISOString(),
    updated_at: new Date(Date.now() - 345600000).toISOString(),
  }),
  // Add some open trades
  createTrade({
    id: "dev-trade-6",
    user_id: "dev-123",
    broker_id: "webull",
    date: new Date(Date.now() - 432000000).toISOString().split("T")[0],
    time: new Date(Date.now() - 432000000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    symbol: "META",
    type: "stock",
    side: "Long",
    quantity: 50,
    price: 300.0,
    total: 15000.0,
    entry_date: new Date(Date.now() - 432000000).toISOString().split("T")[0],
    entry_time: new Date(Date.now() - 432000000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    entry_timestamp: new Date(Date.now() - 432000000).toISOString(),
    entry_price: 300.0,
    status: "open",
    notes: "Open position example",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  }),
];

interface TradeError extends Error {
  code?: string;
  details?: string;
}

// Add this utility function before the useTrades hook
function safeNumber(value: any, fallback?: number): number | undefined {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}

export function useTrades() {
  const { supabase, user } = useSupabaseClient();

  return useQuery<Trade[], TradeError>({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      console.log("[useTrades] Current user:", {
        id: user.id,
        email: user.email,
        isDev: !config.isProduction,
      });

      // Return mock data in development mode
      if (!config.isProduction) {
        // Create mock trades with the actual user ID
        const mockTradesWithUserId = MOCK_TRADES.map((trade) => ({
          ...trade,
          user_id: user.id, // Use actual user ID
        }));
        console.log("[useTrades] Using mock trades with user ID:", user.id);
        return mockTradesWithUserId;
      }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        const tradeError = new Error(error.message) as TradeError;
        tradeError.code = error.code;
        tradeError.details = error.details;
        throw tradeError;
      }

      if (!data) {
        return [];
      }

      // Update the mapping logic with safe number conversion and required fields
      return data.map((rawTrade: RawTradeData) => {
        try {
          const baseTradeData = {
            ...rawTrade,
            // Ensure required fields are present with proper types
            quantity: safeNumber(rawTrade.quantity, 0)!,
            price: safeNumber(rawTrade.price, 0)!,
            total: safeNumber(rawTrade.total, 0)!,
            entry_price: safeNumber(rawTrade.entry_price || rawTrade.price, 0)!,
            // Optional numeric fields
            pnl: safeNumber(rawTrade.pnl),
            exit_price: safeNumber(rawTrade.exit_price),
            risk_reward: safeNumber(rawTrade.risk_reward),
            stop_loss: safeNumber(rawTrade.stop_loss),
            take_profit: safeNumber(rawTrade.take_profit),
            risk_amount: safeNumber(rawTrade.risk_amount),
            fees: safeNumber(rawTrade.fees),
          };

          return createTrade(baseTradeData);
        } catch (error) {
          console.error(`Error processing trade ${rawTrade.id}:`, error);
          // Return a sanitized version of the trade with required fields
          return createTrade({
            ...rawTrade,
            quantity: 0,
            price: 0,
            total: 0,
            entry_price: 0,
            timestamp: rawTrade.timestamp || new Date().toISOString(),
            entry_time:
              rawTrade.entry_time ||
              rawTrade.time ||
              new Date().toISOString().split("T")[1].split(".")[0],
            entry_timestamp:
              rawTrade.entry_timestamp ||
              rawTrade.timestamp ||
              new Date().toISOString(),
            status: "error" as TradeStatus,
          });
        }
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}
