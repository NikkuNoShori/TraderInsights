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

const MOCK_TRADES: Trade[] = [
  createTrade({
    id: "dev-trade-1",
    user_id: "dev-123",
    broker_id: "mock-broker",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().split("T")[1].split(".")[0],
    timestamp: new Date().toISOString(),
    symbol: "AAPL",
    type: "stock",
    side: "Long",
    quantity: 100,
    price: 150.0,
    total: 15000.0,
    entry_date: new Date().toISOString().split("T")[0],
    entry_time: new Date().toISOString().split("T")[1].split(".")[0],
    entry_timestamp: new Date().toISOString(),
    entry_price: 150.0,
    exit_price: 155.0,
    pnl: 500.0,
    status: "closed",
    notes: "Mock trade for development",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  createTrade({
    id: "dev-trade-2",
    user_id: "dev-123",
    broker_id: "mock-broker",
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

      // Return mock data in development mode
      if (!config.isProduction && user.id === "dev-123") {
        return MOCK_TRADES;
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
