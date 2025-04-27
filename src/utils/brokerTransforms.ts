import { Trade, TradeType, TradeSide, TradeStatus } from "@/types/trade";
import {
  SchwabTradeImport,
  BrokerType,
  BROKER_DISPLAY_NAMES,
} from "@/types/broker";
import type { CreateTradeData } from "@/types/trade";
import {
  Position as SnapTradePosition,
  AccountOrderRecord as SnapTradeOrder,
  Balance as SnapTradeBalance,
  Account as SnapTradeAccount,
  Symbol as SnapTradeSymbol,
  Status as OrderStatus,
} from "snaptrade-typescript-sdk";
import { AccountOrderRecord } from "snaptrade-typescript-sdk";
import { BrokerConnection, BrokerAccount, Broker } from "@/types/broker";

// Common date/time parsing utility
export function parseDateTime(
  dateStr: string,
  timeStr?: string
): {
  date: string;
  time: string;
  timestamp: string;
} {
  let parsedDate: Date;

  try {
    // Handle different date formats
    if (timeStr) {
      // If date and time are separate
      parsedDate = new Date(`${dateStr} ${timeStr}`);
    } else {
      // If date is ISO or other standard format
      parsedDate = new Date(dateStr);
    }

    // Ensure we got a valid date
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid date: ${dateStr} ${timeStr || ""}`);
    }

    return {
      date: parsedDate.toISOString().split("T")[0],
      time: parsedDate.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timestamp: parsedDate.toISOString(),
    };
  } catch (error) {
    console.error("Date parsing error:", error);
    const now = new Date();
    return {
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      timestamp: now.toISOString(),
    };
  }
}

// Schwab date format: MM/DD/YYYY
export function transformSchwabTrade(
  trade: SchwabTradeImport
): CreateTradeData {
  const timestamp = new Date(trade.Date).getTime().toString();

  return {
    date: trade.Date,
    time: trade.Date,
    timestamp,
    symbol: trade.Symbol,
    type: "stock" as TradeType,
    side: trade.Action.toUpperCase().includes("BUY") ? "Long" : "Short",
    direction: trade.Action.toUpperCase().includes("BUY") ? "Long" : "Short",
    quantity: trade.Quantity,
    price: trade.Price,
    total: trade.Amount,
    entry_date: trade.Date,
    entry_time: trade.Date,
    entry_timestamp: timestamp,
    entry_price: trade.Price,
    status: "completed" as TradeStatus,
    notes: trade.Description,
    fees: trade.Fees,
  };
}

// TD Ameritrade date format: YYYY-MM-DD
export function transformTDAmeritradeTrade(tdTrade: any): CreateTradeData {
  // TD provides dates in YYYY-MM-DD format and times in 24-hour HH:mm:ss
  const entryDateTime = parseDateTime(
    tdTrade.TransactionDate,
    tdTrade.TransactionTime
  );
  const exitDateTime = tdTrade.ClosingDate
    ? parseDateTime(tdTrade.ClosingDate, tdTrade.ClosingTime)
    : undefined;

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: tdTrade.Symbol,
    type: "stock",
    side: tdTrade.TransactionType.toLowerCase().includes("buy")
      ? "Long"
      : "Short",
    direction: tdTrade.TransactionType.toLowerCase().includes("buy")
      ? "Long"
      : "Short",
    quantity: Number(tdTrade.Quantity),
    price: Number(tdTrade.Price),
    total: Number(tdTrade.Quantity) * Number(tdTrade.Price),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: Number(tdTrade.Price),
    exit_date: exitDateTime?.date,
    exit_time: exitDateTime?.time,
    exit_timestamp: exitDateTime?.timestamp,
    exit_price: exitDateTime ? Number(tdTrade.ClosingPrice) : undefined,
    status: exitDateTime ? "closed" : "open",
    notes: `Imported from TD Ameritrade`,
    fees: Number(tdTrade.Commission || 0) + Number(tdTrade.Fees || 0),
  };
}

// IBKR date format: YYYY-MM-DD HH:mm:ss
export function transformIBKRTrade(ibkrTrade: any): CreateTradeData {
  // IBKR provides dates in YYYY-MM-DD HH:mm:ss format
  const entryDateTime = parseDateTime(ibkrTrade.DateTime);
  const exitDateTime = ibkrTrade.ClosingDateTime
    ? parseDateTime(ibkrTrade.ClosingDateTime)
    : undefined;

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: ibkrTrade.Symbol,
    type: "stock",
    side: ibkrTrade.Side.toLowerCase().includes("buy") ? "Long" : "Short",
    direction: ibkrTrade.Side.toLowerCase().includes("buy") ? "Long" : "Short",
    quantity: Number(ibkrTrade.Quantity),
    price: Number(ibkrTrade.Price),
    total: Number(ibkrTrade.Quantity) * Number(ibkrTrade.Price),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: Number(ibkrTrade.Price),
    exit_date: exitDateTime?.date,
    exit_time: exitDateTime?.time,
    exit_timestamp: exitDateTime?.timestamp,
    exit_price: exitDateTime ? Number(ibkrTrade.ClosingPrice) : undefined,
    status: exitDateTime ? "closed" : "open",
    notes: `Imported from Interactive Brokers`,
    fees: Number(ibkrTrade.Commission || 0) + Number(ibkrTrade.Fees || 0),
  };
}

// SnapTrade date format: ISO string
export function transformSnapTradeTrade(snapTrade: any): CreateTradeData {
  // SnapTrade provides dates in ISO format
  const entryDateTime = parseDateTime(snapTrade.createdAt);
  const exitDateTime = snapTrade.filledAt
    ? parseDateTime(snapTrade.filledAt)
    : undefined;

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: snapTrade.symbol,
    type: "stock",
    side: snapTrade.action === "BUY" ? "Long" : "Short",
    direction: snapTrade.action === "BUY" ? "Long" : "Short",
    quantity: Number(snapTrade.quantity),
    price: Number(snapTrade.price),
    total: Number(snapTrade.quantity) * Number(snapTrade.price),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: Number(snapTrade.price),
    exit_date: exitDateTime?.date,
    exit_time: exitDateTime?.time,
    exit_timestamp: exitDateTime?.timestamp,
    exit_price: exitDateTime ? Number(snapTrade.filledPrice) : undefined,
    status: snapTrade.status === "FILLED" ? "closed" : "open",
    notes: `Imported from ${snapTrade.brokerageName || "SnapTrade"}`,
    fees: 0, // SnapTrade doesn't provide fee information in orders
  };
}

// Export a unified transform function that handles any broker
export function transformTrade(
  trade: any,
  broker: BrokerType
): CreateTradeData {
  switch (broker) {
    case "schwab":
      return transformSchwabTrade(trade);
    case "tdameritrade":
      return transformTDAmeritradeTrade(trade);
    case "ibkr":
      return transformIBKRTrade(trade);
    case "webull":
      // Webull trades now come through SnapTrade in IBKR format
      return transformIBKRTrade(trade);
    case "snaptrade":
      return transformSnapTradeTrade(trade);
    default:
      throw new Error(`Unsupported broker type: ${broker}`);
  }
}

// Remove Webull transforms since we're using SnapTrade
export function transformBrokerTrade(trade: any, broker: string) {
  switch (broker.toLowerCase()) {
    case "charlesschwab":
      return transformSchwabTrade(trade);
    case "tdameritrade":
      return transformTDAmeritradeTrade(trade);
    case "ibkr":
      return transformIBKRTrade(trade);
    default:
      throw new Error(`Unsupported broker: ${broker}`);
  }
}

// Transform Charles Schwab CSV data to Trade objects
export function transformSchwabTrades(trades: SchwabTradeImport[]): Trade[] {
  return trades.map((trade) => ({
    id: generateTradeId(trade),
    date: new Date(trade.Date).toISOString(),
    symbol: trade.Symbol,
    type: trade.Action.toLowerCase() as TradeType,
    quantity: trade.Quantity,
    price: trade.Price,
    fees: trade.Fees || 0,
    total: Math.abs(trade.Amount),
    notes: trade.Description || "",
    source: "charlesschwab" as BrokerType,
    user_id: "", // Will be set by the service layer
    time: new Date(trade.Date).toISOString(),
    timestamp: new Date(trade.Date).getTime().toString(),
    side: trade.Action.toLowerCase() as TradeSide,
    direction: trade.Action.toLowerCase() as TradeSide,
    entry_date: new Date(trade.Date).toISOString(),
    entry_time: new Date(trade.Date).toISOString(),
    entry_timestamp: new Date(trade.Date).getTime().toString(),
    exit_date: "",
    exit_time: "",
    exit_timestamp: "",
    entry_price: trade.Price,
    status: "COMPLETED" as TradeStatus,
    created_at: new Date(trade.Date).toISOString(),
    updated_at: new Date(trade.Date).toISOString(),
  }));
}

// Transform SnapTrade position to Trade object
export function transformSnapTradePosition(
  position: SnapTradePosition
): Partial<CreateTradeData> {
  const units = position.units || 0;
  const price = position.price || 0;

  return {
    type: "stock" as TradeType,
    symbol: getSymbolString(position.symbol),
    shares: units,
    price: price,
    status: "completed" as TradeStatus,
    side: units > 0 ? ("Long" as TradeSide) : ("Short" as TradeSide),
    date: new Date().toISOString(),
    fees: 0,
    total: units * price,
  };
}

// Transform SnapTrade order to Trade object
export function transformSnapTradeOrder(
  order: SnapTradeOrder
): Partial<CreateTradeData> {
  const units = order.units || 0;
  const price = order.price || 0;

  return {
    type: "stock" as TradeType,
    symbol: order.symbol || "",
    shares: units,
    price: price,
    status: getTradeStatus(order.status),
    side:
      order.action === "BUY" ? ("Long" as TradeSide) : ("Short" as TradeSide),
    date: order.time || new Date().toISOString(),
    fees: 0,
    total: units * price,
  };
}

// Generate unique trade ID from Schwab trade data
function generateTradeId(trade?: SchwabTradeImport): string {
  if (trade) {
    // Generate ID based on trade data for consistency
    return `${trade.Date}_${trade.Symbol}_${trade.Action}_${trade.Quantity}_${trade.Price}`.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );
  }
  // Generate random ID if no trade data provided
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function getBrokerDisplayName(broker: BrokerType): string {
  const brokerNames: Record<BrokerType, string> = {
    charlesschwab: "Charles Schwab",
    snaptrade: "SnapTrade",
  };
  return brokerNames[broker] || broker;
}

// Broker display names
export const brokerDisplayNames: Record<BrokerType, string> = {
  schwab: "Charles Schwab",
  snaptrade: "SnapTrade",
};

function getTradeStatus(status: OrderStatus): TradeStatus {
  switch (status) {
    case OrderStatus.EXECUTED:
      return "completed";
    case OrderStatus.CANCELED:
    case OrderStatus.REJECTED:
    case OrderStatus.FAILED:
      return "cancelled";
    case OrderStatus.PENDING:
    case OrderStatus.ACCEPTED:
    default:
      return "pending";
  }
}

function getSymbolString(symbol: SnapTradeSymbol | undefined): string {
  return symbol?.symbol || "";
}

export function transformSnapTradeBroker(broker: SnapTradeBrokerage): Broker {
  if (!broker.name) {
    throw new Error("Invalid broker data: missing name");
  }

  // Only map to supported broker types
  const brokerType: BrokerType = broker.name.toLowerCase().includes("schwab")
    ? "schwab"
    : "snaptrade";

  return {
    id: broker.id,
    name: broker.name,
    type: brokerType,
    display_name: broker.name,
    logo_url: broker.logo_url,
    url: broker.url,
  };
}
