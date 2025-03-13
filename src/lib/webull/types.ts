/**
 * This file exports the types from the webull-api-ts package and our internal types for comparison.
 */

// Import types from webull-api-ts
import * as WebullApiTypes from 'webull-api-ts';

// Re-export the types from webull-api-ts
export { WebullApiTypes };

// Define our internal WebUll types
export interface WebullCredentials {
  username: string;
  password: string;
  deviceId?: string;
  deviceName?: string;
  mfaCode?: string;
}

export interface WebullAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
  uuid: string;
}

export interface WebullOrder {
  orderId: string;
  symbol: string;
  action: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  timeInForce: "GTC" | "DAY" | "IOC";
  quantity: number;
  filledQuantity: number;
  price?: number;
  filledPrice?: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED" | "PARTIAL_FILLED";
  createTime: string;
  updateTime: string;
  commission?: number;
}

export interface WebullPosition {
  symbol: string;
  quantity: number;
  avgCost: number;
  marketValue: number;
  lastPrice: number;
  unrealizedPnl: number;
  unrealizedPnlRate: number;
  lastUpdated: string;
}

export interface WebullAccount {
  accountId: string;
  accountType: string;
  currency: string;
  dayTrader: boolean;
  netLiquidation: number;
  totalCash: number;
  buyingPower: number;
  totalPositionValue: number;
}

// Define our internal Trade types
export interface Trade {
  id: string;
  user_id: string;
  broker_id?: string;
  date: string;
  time: string;
  timestamp: string;
  symbol: string;
  type: "stock" | "option" | "crypto" | "forex";
  side: "Long" | "Short";
  direction: "Long" | "Short";
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
  status: "open" | "closed" | "pending";
  notes?: string;
  setup_type?: string;
  strategy?: string;
  risk_reward?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_amount?: number;
  fees?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// Define the mapping between WebUll types and our internal types
export const typeMapping = {
  // WebUll Order to Trade mapping
  orderToTrade: {
    orderId: 'id',
    symbol: 'symbol',
    action: 'side', // Needs transformation: "BUY" -> "Long", "SELL" -> "Short"
    quantity: 'quantity',
    price: 'price',
    filledPrice: 'entry_price',
    status: 'status', // Needs transformation
    createTime: 'entry_timestamp', // Needs parsing
    updateTime: 'updated_at', // Needs parsing
    commission: 'fees',
  },
  
  // WebUll Position to Trade mapping
  positionToTrade: {
    symbol: 'symbol',
    quantity: 'quantity',
    avgCost: 'entry_price',
    lastPrice: 'price',
    unrealizedPnl: 'pnl',
    lastUpdated: 'updated_at', // Needs parsing
  }
};

// Define the transformation functions
export const transformations = {
  // Transform WebUll action to our side
  action: (action: string): "Long" | "Short" => {
    return action.toLowerCase() === 'buy' ? 'Long' : 'Short';
  },
  
  // Transform WebUll status to our status
  status: (status: string): "open" | "closed" | "pending" => {
    switch (status.toLowerCase()) {
      case 'filled':
        return 'closed';
      case 'pending':
      case 'partial_filled':
        return 'open';
      default:
        return 'pending';
    }
  },
  
  // Parse WebUll date string to our date format
  parseDate: (dateStr: string): { date: string, time: string, timestamp: string } => {
    const date = new Date(dateStr);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      timestamp: date.toISOString(),
    };
  }
}; 