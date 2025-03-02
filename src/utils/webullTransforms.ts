import type { WebullTrade } from "@/services/webullService";
import type { Trade, TradeType, TradeSide, TradeStatus } from "@/types/trade";

export function transformWebullTrade(
  webullTrade: WebullTrade
): Omit<Trade, "id" | "user_id" | "created_at" | "updated_at"> {
  // Map Webull action to our TradeSide
  const side: TradeSide = webullTrade.action === "BUY" ? "Long" : "Short";

  // Map status
  const status: TradeStatus =
    webullTrade.status === "FILLED" ? "closed" : "pending";

  // Default to stock type for now
  const type: TradeType = "stock";

  // Parse the timestamp properly
  const timestamp = new Date(webullTrade.createTime);
  const date = timestamp.toISOString().split("T")[0];
  const time = timestamp.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    date,
    time,
    timestamp: webullTrade.createTime, // Store original ISO timestamp
    symbol: webullTrade.symbol,
    type,
    side,
    direction: side,
    quantity: webullTrade.filledQuantity || webullTrade.quantity,
    price: webullTrade.filledPrice || webullTrade.price || 0,
    total:
      (webullTrade.filledPrice || webullTrade.price || 0) *
      (webullTrade.filledQuantity || webullTrade.quantity),
    entry_date: webullTrade.createTime,
    entry_time: time,
    entry_timestamp: webullTrade.createTime,
    entry_price: webullTrade.filledPrice || webullTrade.price || 0,
    exit_date:
      webullTrade.status === "FILLED"
        ? new Date(webullTrade.updateTime).toISOString().split("T")[0]
        : undefined,
    exit_time:
      webullTrade.status === "FILLED"
        ? new Date(webullTrade.updateTime).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : undefined,
    exit_timestamp:
      webullTrade.status === "FILLED" ? webullTrade.updateTime : undefined,
    exit_price:
      webullTrade.status === "FILLED" ? webullTrade.filledPrice : undefined,
    status,
    notes: `Webull Order ID: ${webullTrade.orderId}\nOrder Type: ${webullTrade.orderType}\nTime In Force: ${webullTrade.timeInForce}`,
    fees: (webullTrade.commission || 0) + (webullTrade.fees || 0),
  };
}

export function transformWebullTrades(
  webullTrades: WebullTrade[]
): Partial<Trade>[] {
  return webullTrades.map((webullTrade) => {
    const isLong = webullTrade.action.toLowerCase() === "buy";
    let createDate = new Date(webullTrade.createTime);

    // Ensure valid date
    if (isNaN(createDate.getTime())) {
      console.error("Invalid date from Webull trade:", webullTrade.createTime);
      createDate = new Date(); // Fallback to current date
    }

    const dateStr = createDate.toISOString().split("T")[0];
    const timeStr = createDate.toISOString().split("T")[1].split(".")[0];

    return {
      symbol: webullTrade.symbol,
      type: "stock",
      side: isLong ? "Long" : "Short",
      direction: isLong ? "Long" : "Short",
      quantity: webullTrade.filledQuantity || webullTrade.quantity,
      price: webullTrade.filledPrice || webullTrade.price || 0,
      total:
        (webullTrade.filledQuantity || webullTrade.quantity) *
        (webullTrade.filledPrice || webullTrade.price || 0),
      date: dateStr,
      time: timeStr,
      entry_date: webullTrade.createTime,
      entry_price: webullTrade.filledPrice || webullTrade.price || 0,
      exit_date:
        webullTrade.status === "FILLED" ? webullTrade.updateTime : undefined,
      exit_price:
        webullTrade.status === "FILLED" ? webullTrade.filledPrice : undefined,
      status: webullTrade.status.toLowerCase() === "filled" ? "closed" : "open",
      notes: `Imported from Webull - Order ID: ${webullTrade.orderId}`,
      fees: (webullTrade.commission || 0) + (webullTrade.fees || 0),
      pnl: undefined,
    };
  });
}
