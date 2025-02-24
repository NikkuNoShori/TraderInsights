import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "./useSupabaseClient";
import { Trade } from "../types/trade";
import { config } from "../config";

const MOCK_TRADES: Trade[] = [
  {
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
  },
  {
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
  },
];

export function useTrades() {
  const { supabase, user } = useSupabaseClient();

  return useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Return mock data in development mode
      if (!config.isProduction && user.id === "dev-123") {
        return MOCK_TRADES;
      }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Ensure all required fields are present
      return (data || []).map(
        (trade): Trade => ({
          ...trade,
          entry_date: trade.entry_date || trade.date,
          entry_price: trade.entry_price || trade.price,
        })
      );
    },
    enabled: !!user,
  });
}
