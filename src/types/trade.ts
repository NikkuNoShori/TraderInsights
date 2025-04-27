import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { BrokerType } from "./broker";

export type TradeType = "stock" | "option" | "crypto" | "forex";
export type TradeSide = "Long" | "Short";
export type TradeStatus = "pending" | "completed" | "cancelled";

export interface OptionDetails {
  strike: number;
  expiration: string;
  option_type: "call" | "put";
  contract_type: "call" | "put";
}

export interface BaseTrade {
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

// Main Trade type that includes all fields
export type Trade = BaseTrade;

// Type for creating a new trade
export type CreateTradeData = Omit<
  Trade,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// Type for updating an existing trade
export type UpdateTradeData = Partial<CreateTradeData>;

// Type for portfolio trades (simplified version)
export type PortfolioTrade = Pick<
  Trade,
  | "id"
  | "symbol"
  | "type"
  | "side"
  | "quantity"
  | "price"
  | "date"
  | "fees"
  | "notes"
> & {
  portfolio_id: string;
};

// Type for database trades (simplified version)
export type DatabaseTrade = Pick<
  Trade,
  | "id"
  | "user_id"
  | "symbol"
  | "entry_price"
  | "exit_price"
  | "quantity"
  | "side"
  | "entry_date"
  | "exit_date"
  | "pnl"
  | "notes"
  | "created_at"
  | "updated_at"
>;

export interface TradeFilters {
  brokers?: string[];
  dateRange?: [Date, Date];
  symbols?: string[];
  types?: TradeType[];
  sides?: TradeSide[];
  status?: TradeStatus[];
  minPnl?: number;
  maxPnl?: number;
  setupTypes?: string[];
  strategies?: string[];
  winLoss?: "win" | "loss";
  timeframe?: TimeframeOption;
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averagePnl: number;
  totalPnl: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  expectancy: number;
  sharpeRatio?: number;
  maxDrawdown: number;
}

export function formatTradeValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function getPnLColor(pnl: number | undefined | null): string {
  if (!pnl) return "text-gray-500";
  return pnl > 0 ? "text-green-500" : "text-red-500";
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

// Helper function to ensure both side and direction are set
export function createTrade(data: Omit<Trade, "direction">): Trade {
  return {
    ...data,
    direction: data.side, // Always set direction to match side
  };
}

// Helper function to ensure both side and direction are set when updating
export function updateTrade(data: Partial<Trade>): Partial<Trade> {
  if (data.side && !data.direction) {
    return {
      ...data,
      direction: data.side,
    };
  }
  if (data.direction && !data.side) {
    return {
      ...data,
      side: data.direction,
    };
  }
  return data;
}
