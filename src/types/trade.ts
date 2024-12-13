export interface OptionDetails {
  strike: number;
  expiration: string;
  contract_type: 'call' | 'put';
}

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  type: 'stock' | 'option';
  side: 'Long' | 'Short';
  quantity: number;
  price: number;
  total: number;
  notes?: string | null;
  chart_image?: string | null;
  option_details?: OptionDetails | null;
  status: 'open' | 'closed' | 'pending';
  remaining_quantity?: number;
  avg_entry_price?: number;
  avg_exit_price?: number;
  entry_price?: number;
  exit_price?: number;
  pnl?: number;
  created_at: string;
  updated_at: string;
  setup_type?: string;
  timeframe?: string;
  risk_amount?: number;
  stop_loss?: number;
  take_profit?: number;
  fees?: number;
  execution_quality?: number;
  emotion_rating?: number;
  market_conditions?: string;
  tags?: string[];
  planned_entry?: number;
  planned_exit?: number;
  plan_followed?: boolean;
  position_size_percentage?: number;
}

export function formatTradeValue(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}