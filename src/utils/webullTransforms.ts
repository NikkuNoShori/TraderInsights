import type { WebullTrade } from "@/services/webullService";
import type { CreateTradeData } from "@/types/trade";

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

export function transformWebullTrade(
  webullTrade: WebullTrade
): CreateTradeData {
  // Map Webull action to our TradeSide
  const side = webullTrade.action.toLowerCase() === "buy" ? "Long" : "Short";

  // Parse dates
  const entryDateTime = parseDateTime(webullTrade.createTime);

  return {
    date: entryDateTime.date,
    time: entryDateTime.time,
    timestamp: entryDateTime.timestamp,
    symbol: webullTrade.symbol,
    type: "stock",
    side,
    direction: side,
    quantity: webullTrade.filledQuantity || webullTrade.quantity,
    price: webullTrade.filledPrice || webullTrade.price || 0,
    total:
      (webullTrade.filledQuantity || webullTrade.quantity) *
      (webullTrade.filledPrice || webullTrade.price || 0),
    entry_date: entryDateTime.date,
    entry_time: entryDateTime.time,
    entry_timestamp: entryDateTime.timestamp,
    entry_price: webullTrade.filledPrice || webullTrade.price || 0,
    status: webullTrade.status.toLowerCase() === "filled" ? "closed" : "open",
    notes: `Imported from Webull - Order ID: ${webullTrade.orderId}`,
    fees: webullTrade.commission || 0,
  };
}

export function transformWebullTrades(
  webullTrades: WebullTrade[]
): CreateTradeData[] {
  console.log("Starting trade transformation with trades:", webullTrades);

  // Group trades by symbol and order ID prefix (to match pairs)
  const tradesBySymbolAndId = webullTrades.reduce((acc, trade) => {
    const symbol = trade.symbol;
    const orderId = trade.orderId.split("-")[2]; // Get the unique ID part
    const key = `${symbol}-${orderId}`;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(trade);
    return acc;
  }, {} as Record<string, WebullTrade[]>);

  const transformedTrades: CreateTradeData[] = [];

  // Process each group of trades
  Object.entries(tradesBySymbolAndId).forEach(([key, trades]) => {
    // Sort trades by date
    const sortedTrades = [...trades].sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    );

    // Separate buy and sell trades
    const buyTrades = sortedTrades.filter(
      (t) => t.action.toLowerCase() === "buy"
    );
    const sellTrades = sortedTrades.filter(
      (t) => t.action.toLowerCase() === "sell"
    );

    console.log(
      `Found ${buyTrades.length} BUY trades and ${sellTrades.length} SELL trades for ${key}`
    );

    // If we have both buy and sell trades, create a complete trade
    if (buyTrades.length > 0 && sellTrades.length > 0) {
      const buyTrade = buyTrades[0];
      const sellTrade = sellTrades[0];

      // Determine if this is a long or short trade
      const isLongTrade =
        new Date(buyTrade.createTime) < new Date(sellTrade.createTime);

      // Calculate entry and exit prices
      const entryPrice = isLongTrade
        ? buyTrade.filledPrice || buyTrade.price || 0
        : sellTrade.filledPrice || sellTrade.price || 0;

      const exitPrice = isLongTrade
        ? sellTrade.filledPrice || sellTrade.price || 0
        : buyTrade.filledPrice || buyTrade.price || 0;

      // Calculate quantity
      const quantity = buyTrade.filledQuantity || buyTrade.quantity;

      // Calculate P&L
      const pnl = isLongTrade
        ? (exitPrice - entryPrice) * quantity
        : (entryPrice - exitPrice) * quantity;

      // Calculate fees
      const fees = (buyTrade.commission || 0) + (sellTrade.commission || 0);

      // Parse dates
      const entryDateTime = parseDateTime(
        isLongTrade ? buyTrade.createTime : sellTrade.createTime
      );

      const exitDateTime = parseDateTime(
        isLongTrade ? sellTrade.createTime : buyTrade.createTime
      );

      // Create a complete trade
      const completeTrade: CreateTradeData = {
        date: entryDateTime.date,
        time: entryDateTime.time,
        timestamp: entryDateTime.timestamp,
        symbol: buyTrade.symbol,
        type: "stock",
        side: isLongTrade ? "Long" : "Short",
        direction: isLongTrade ? "Long" : "Short",
        quantity,
        price: exitPrice,
        total: quantity * exitPrice,
        entry_date: entryDateTime.date,
        entry_time: entryDateTime.time,
        entry_timestamp: entryDateTime.timestamp,
        entry_price: entryPrice,
        exit_date: exitDateTime.date,
        exit_time: exitDateTime.time,
        exit_timestamp: exitDateTime.timestamp,
        exit_price: exitPrice,
        status: "closed",
        notes: `Imported from Webull - Trade Pair: ${buyTrade.orderId} & ${sellTrade.orderId}`,
        fees,
        pnl: pnl - fees,
      };

      transformedTrades.push(completeTrade);
    } else {
      // Process single trades (either buy or sell without a match)
      sortedTrades.forEach((trade) => {
        transformedTrades.push(transformWebullTrade(trade));
      });
    }
  });

  return transformedTrades;
}
