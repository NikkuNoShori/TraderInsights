// Auth types
export * from "./auth";

// Broker types
export * from "./broker";

// Dashboard types
export * from "./dashboard";

// Error types
export * from "./error";

// Portfolio types
export {
  type Portfolio as PortfolioType,
  type Trade as PortfolioTrade,
  type TradeMetrics as PortfolioTradeMetrics,
  type PortfolioMetrics,
  type PortfolioType as PortfolioKind,
  type PortfolioCurrency,
  type CreatePortfolioData,
  type UpdatePortfolioData,
} from "./portfolio";

// Profile types
export { type Profile as UserProfile } from "./profile";

// Stock types
export * from "./stock";

// Supabase types
export * from "./supabase";

// Theme types
export * from "./theme";

// Trade types
export {
  type Trade as TradeModel,
  type TradeStatus,
  type TradeType,
  type TradeSide,
  type OptionDetails,
  type TradeFilters,
  type TradeStats,
  type CreateTradeData,
  type UpdateTradeData,
} from "./trade";

// Transaction types
export {
  type Transaction as TransactionModel,
  type TransactionSide as TxSide,
  type TransactionStatus as TxStatus,
  type TransactionType,
  type NewTransaction,
} from "./transaction";

// Watchlist types
export * from "./watchlist";

// Polygon types
export * from "./polygon.d";

export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  entry_price: number;
  exit_price?: number;
  quantity: number;
  side: "buy" | "sell";
  date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  pnl?: number;
  strategy?: string;
  market?: string;
  timeframe?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
