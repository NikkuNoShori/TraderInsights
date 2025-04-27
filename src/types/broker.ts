export interface Broker {
  id: string;
  name: string;
  type: BrokerType;
  status: "active" | "inactive" | "pending" | "error";
}

export type BrokerType = "schwab" | "snaptrade";

// Charles Schwab CSV format
export interface SchwabTradeImport {
  Date: string;
  Symbol: string;
  Action: string;
  Quantity: number;
  Price: number;
  Fees: number;
  Amount: number;
  Description: string;
}

// Map broker types to display names
export const brokerNames: Record<BrokerType, string> = {
  schwab: "Charles Schwab",
  snaptrade: "SnapTrade",
};

export interface BrokerConnection {
  id: string;
  broker: BrokerType;
  userId: string;
  status: "connected" | "disconnected";
  lastSynced?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerAccount {
  id: string;
  broker: BrokerType;
  userId: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  balance?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerConfig {
  displayName: string;
  type: BrokerType;
  enabled: boolean;
}

export const BROKER_DISPLAY_NAMES: Record<BrokerType, string> = {
  schwab: "Charles Schwab",
  snaptrade: "SnapTrade",
};
