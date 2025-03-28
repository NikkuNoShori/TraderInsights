export interface BrokerProfile {
  id: string;
  user_id: string;
  name: string; // e.g., "Charles Schwab (New)"
  type: "charlesschwab" | "tdameritrade" | "ibkr" | "webull" | "other";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BrokerType = "charlesschwab" | "tdameritrade" | "ibkr" | "webull" | "snaptrade" | "other";

// Charles Schwab CSV format
export interface SchwabTradeImport {
  Date: string; // "12/6/2024"
  Action: string; // "Buy" | "Sell"
  Symbol: string; // "ZENA"
  Description: string; // "ZENATECH INC F"
  Quantity: number; // 55
  Price: number; // 6.22
  Fees: number; // Optional
  Amount: number; // -342.10
}
