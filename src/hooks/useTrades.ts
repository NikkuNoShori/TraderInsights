import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "./useSupabaseClient";
import {
  Trade,
  createTrade,
  type TradeType,
  type TradeSide,
  type TradeStatus,
} from "../types/trade";
import { config } from "@/config";

interface RawTradeData {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  quantity: number;
  price: number;
  total: number;
  entry_date?: string;
  entry_price?: number;
  exit_date?: string;
  exit_price?: number;
  pnl?: number;
  status: TradeStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const MOCK_TRADES: Trade[] = [
  createTrade({
    id: "dev-trade-1",
    user_id: "dev-123",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toISOString().split("T")[1].split(".")[0],
    symbol: "AAPL",
    type: "stock",
    side: "Long",
    quantity: 100,
    price: 150.0,
    total: 15000.0,
    entry_date: new Date().toISOString(),
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
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    time: new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[1]
      .split(".")[0],
    symbol: "TSLA",
    type: "stock",
    side: "Long",
    quantity: 50,
    price: 200.0,
    total: 10000.0,
    entry_date: new Date(Date.now() - 86400000).toISOString(),
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

      // Ensure all required fields are present and properly formatted
      return data.map(
        (rawTrade: RawTradeData): Trade =>
          createTrade({
            ...rawTrade,
            entry_date: rawTrade.entry_date || rawTrade.date,
            entry_price: rawTrade.entry_price || rawTrade.price,
            // Ensure numeric fields are properly typed
            quantity: Number(rawTrade.quantity),
            price: Number(rawTrade.price),
            total: Number(rawTrade.total),
            pnl: rawTrade.pnl ? Number(rawTrade.pnl) : undefined,
            exit_price: rawTrade.exit_price
              ? Number(rawTrade.exit_price)
              : undefined,
          })
      );
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}
