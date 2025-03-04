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

  // Group trades by symbol
  const tradesBySymbol = webullTrades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, WebullTrade[]>);

  const transformedTrades: CreateTradeData[] = [];

  // Process each symbol's trades
  Object.entries(tradesBySymbol).forEach(([symbol, trades]) => {
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
      `Found ${buyTrades.length} BUY trades and ${sellTrades.length} SELL trades for ${symbol}`
    );

    // Process each buy trade
    buyTrades.forEach((buyTrade) => {
      // Transform and add the buy trade
      transformedTrades.push(transformWebullTrade(buyTrade));

      // Look for a matching sell trade
      const matchingSellIndex = sellTrades.findIndex(
        (sell) =>
          sell.symbol === buyTrade.symbol &&
          (sell.filledQuantity || sell.quantity) ===
            (buyTrade.filledQuantity || buyTrade.quantity) &&
          new Date(sell.createTime) > new Date(buyTrade.createTime)
      );

      if (matchingSellIndex !== -1) {
        const matchingSellTrade = sellTrades[matchingSellIndex];
        console.log(
          `Found matching SELL trade for BUY trade ${buyTrade.orderId} -> ${matchingSellTrade.orderId}`
        );

        // Transform and add the sell trade
        transformedTrades.push(transformWebullTrade(matchingSellTrade));

        // Remove the processed sell trade
        sellTrades.splice(matchingSellIndex, 1);
      }
    });

    // Add any remaining unmatched sell trades
    sellTrades.forEach((sellTrade) => {
      transformedTrades.push(transformWebullTrade(sellTrade));
    });
  });

  return transformedTrades;
}
