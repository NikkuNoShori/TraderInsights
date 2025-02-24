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
  portfolio_id?: string;
  symbol: string;
  type: TradeType;
  side: TradeSide;
  quantity: number;
  price: number;
  total: number;
  date: string;
  time: string;
  entry_date: string;
  entry_price: number;
  exit_price?: number;
  status: TradeStatus;
  notes?: string;
  option_details?: OptionDetails;
  created_at: string;
  updated_at: string;
  pnl?: number;
  fees?: number;
  risk_amount?: number;
  stop_loss?: number;
  take_profit?: number;
  remaining_quantity?: number;
  strategy?: string;
  risk_reward?: number;
  tags?: string[];
  avg_entry_price?: number;
  avg_exit_price?: number;
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
