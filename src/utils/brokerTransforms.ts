import type { Trade } from "@/types/trade";
import type { BrokerType } from "@/types/broker";
import type { CreateTradeData } from "@/types/trade";

// Common date/time parsing utility
export function parseDateTime(
  dateStr: string,
  timeStr?: string,
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
  schwabTrade: any,
): CreateTradeData {
  // Schwab provides dates as MM/DD/YYYY and times as HH:MM:SS AM/PM
  const entryDateTime = parseDateTime(schwabTrade.Date, schwabTrade.Time);
  const exitDateTime = schwabTrade.ClosedDate
    ? parseDateTime(schwabTrade.ClosedDate, schwabTrade.ClosedTime)
    : undefined;

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: schwabTrade.Symbol,
    type: "stock",
    side: schwabTrade.Action.toLowerCase().includes("buy") ? "Long" : "Short",
    direction: schwabTrade.Action.toLowerCase().includes("buy")
      ? "Long"
      : "Short",
    quantity: Number(schwabTrade.Quantity),
    price: Number(schwabTrade.Price),
    total: Number(schwabTrade.Quantity) * Number(schwabTrade.Price),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: Number(schwabTrade.Price),
    exit_date: exitDateTime?.date,
    exit_time: exitDateTime?.time,
    exit_timestamp: exitDateTime?.timestamp,
    exit_price: exitDateTime ? Number(schwabTrade.ClosedPrice) : undefined,
    status: exitDateTime ? "closed" : "open",
    notes: `Imported from Charles Schwab`,
    fees: Number(schwabTrade.Commission || 0),
  };
}

// TD Ameritrade date format: YYYY-MM-DD
export function transformTDAmeritradeTrade(
  tdTrade: any,
): CreateTradeData {
  // TD provides dates in YYYY-MM-DD format and times in 24-hour HH:mm:ss
  const entryDateTime = parseDateTime(
    tdTrade.TransactionDate,
    tdTrade.TransactionTime,
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
export function transformIBKRTrade(
  ibkrTrade: any,
): CreateTradeData {
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

// Webull date format: YYYY-MM-DD HH:mm:ss
export function transformWebullTrade(
  webullTrade: any,
): CreateTradeData {
  // Webull provides dates in YYYY-MM-DD HH:mm:ss format
  const entryDateTime = parseDateTime(webullTrade.DateTime);
  const exitDateTime = webullTrade.ClosingDateTime
    ? parseDateTime(webullTrade.ClosingDateTime)
    : undefined;

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: webullTrade.Symbol,
    type: "stock",
    side: webullTrade.Side.toLowerCase().includes("buy") ? "Long" : "Short",
    direction: webullTrade.Side.toLowerCase().includes("buy") ? "Long" : "Short",
    quantity: Number(webullTrade.Quantity),
    price: Number(webullTrade.Price),
    total: Number(webullTrade.Quantity) * Number(webullTrade.Price),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: Number(webullTrade.Price),
    exit_date: exitDateTime?.date,
    exit_time: exitDateTime?.time,
    exit_timestamp: exitDateTime?.timestamp,
    exit_price: exitDateTime ? Number(webullTrade.ClosingPrice) : undefined,
    status: exitDateTime ? "closed" : "open",
    notes: `Imported from Webull`,
    fees: Number(webullTrade.Commission || 0) + Number(webullTrade.Fees || 0),
  };
}

// SnapTrade date format: ISO string
export function transformSnapTradeTrade(
  snapTrade: any,
): CreateTradeData {
  // SnapTrade provides dates in ISO format
  const entryDateTime = parseDateTime(snapTrade.createdAt);
  const exitDateTime = snapTrade.filledAt ? parseDateTime(snapTrade.filledAt) : undefined;

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
    notes: `Imported from ${snapTrade.brokerageName || 'SnapTrade'}`,
    fees: 0, // SnapTrade doesn't provide fee information in orders
  };
}

// Export a unified transform function that handles any broker
export function transformTrade(trade: any, broker: BrokerType): CreateTradeData {
  switch (broker) {
    case "charlesschwab":
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
