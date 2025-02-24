export type TradeType = "stock" | "option" | "crypto" | "forex";
export type TradeSide = "Long" | "Short";
export type TradeStatus = "open" | "closed" | "pending";

export interface OptionDetails {
  strike: number;
  expiration: string;
  option_type: "call" | "put";
  contract_type: "call" | "put";
}

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  direction: TradeSide; // Alias for side for backward compatibility
  quantity: number;
  price: number;
  total: number;
  entry_date: string;
  entry_price: number;
  exit_date?: string;
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

export interface TradeFilters {
  dateRange?: [Date, Date];
  symbols?: string[];
  types?: string[];
  sides?: ("Long" | "Short")[];
  status?: ("pending" | "open" | "closed")[];
  minPnl?: number;
  maxPnl?: number;
  setupTypes?: string[];
  strategies?: string[];
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

export type CreateTradeData = Omit<
  Trade,
  "id" | "user_id" | "created_at" | "updated_at"
> & {
  total?: number;
};

export type UpdateTradeData = Partial<CreateTradeData>;

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
