import type { WebullTrade } from "@/services/webullService";
import type {
  Trade,
  TradeType,
  TradeSide,
  TradeStatus,
  CreateTradeData,
} from "@/types/trade";

export function transformWebullTrade(
  webullTrade: WebullTrade
): CreateTradeData {
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

  const quantity = webullTrade.filledQuantity || webullTrade.quantity;
  const entryPrice = webullTrade.filledPrice || webullTrade.price || 0;
  const total = quantity * entryPrice;

  const trade: CreateTradeData = {
    broker_id: "webull",
    date,
    time,
    timestamp: webullTrade.createTime,
    symbol: webullTrade.symbol,
    type,
    side,
    direction: side,
    quantity,
    price: entryPrice,
    total,
    entry_date: date,
    entry_time: time,
    entry_timestamp: webullTrade.createTime,
    entry_price: entryPrice,
    status,
    notes: `Webull Order ID: ${webullTrade.orderId}\nOrder Type: ${webullTrade.orderType}\nTime In Force: ${webullTrade.timeInForce}`,
    fees: (webullTrade.commission || 0) + (webullTrade.fees || 0),
  };

  // Add exit information if the trade is closed
  if (status === "closed") {
    const exitTimestamp = new Date(webullTrade.updateTime);
    trade.exit_date = exitTimestamp.toISOString().split("T")[0];
    trade.exit_time = exitTimestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    trade.exit_timestamp = webullTrade.updateTime;
    trade.exit_price = webullTrade.filledPrice || webullTrade.price;

    if (trade.exit_price) {
      trade.pnl =
        side === "Long"
          ? (trade.exit_price - entryPrice) * quantity
          : (entryPrice - trade.exit_price) * quantity;
    }
  }

  return trade;
}

export function transformWebullTrades(
  webullTrades: WebullTrade[]
): CreateTradeData[] {
  console.log("Starting trade transformation with trades:", webullTrades);

  // Group trades by symbol and quantity to find matching pairs
  const tradePairs = new Map<string, WebullTrade[]>();
  webullTrades.forEach((trade) => {
    const key = `${trade.symbol}_${trade.quantity}`;
    const existingTrades = tradePairs.get(key) || [];
    tradePairs.set(key, [...existingTrades, trade]);
  });

  const processedTrades: CreateTradeData[] = [];

  // Process each group of trades
  tradePairs.forEach((trades, key) => {
    console.log(`Processing trade group for ${key}...`);

    // Sort trades by createTime to ensure proper order
    trades.sort(
      (a, b) =>
        new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    );

    // Find matching BUY and SELL trades
    const buyTrades = trades.filter((t) => t.action === "BUY");
    const sellTrades = trades.filter((t) => t.action === "SELL");

    console.log(
      `Found ${buyTrades.length} BUY trades and ${sellTrades.length} SELL trades for ${key}`
    );

    // Process BUY trades and match them with SELL trades
    buyTrades.forEach((buyTrade, index) => {
      const matchingSellTrade = sellTrades[index];
      const processedTrade = transformWebullTrade(buyTrade);

      // If we have a matching SELL trade, use it to set exit information
      if (matchingSellTrade) {
        console.log(
          `Found matching SELL trade for BUY trade ${buyTrade.orderId}`
        );
        const exitTimestamp = new Date(matchingSellTrade.createTime);
        processedTrade.exit_date = exitTimestamp.toISOString().split("T")[0];
        processedTrade.exit_time = exitTimestamp.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        processedTrade.exit_timestamp = matchingSellTrade.createTime;
        processedTrade.exit_price =
          matchingSellTrade.filledPrice || matchingSellTrade.price;
        processedTrade.status = "closed";

        // Calculate PnL
        if (processedTrade.exit_price) {
          processedTrade.pnl =
            processedTrade.side === "Long"
              ? (processedTrade.exit_price - processedTrade.entry_price) *
                processedTrade.quantity
              : (processedTrade.entry_price - processedTrade.exit_price) *
                processedTrade.quantity;
        }

        // Add the matching order ID to notes
        processedTrade.notes += `\nMatching Sell Order ID: ${matchingSellTrade.orderId}`;

        // Add fees from both trades
        processedTrade.fees =
          (processedTrade.fees || 0) +
          ((matchingSellTrade.commission || 0) + (matchingSellTrade.fees || 0));
      }

      processedTrades.push(processedTrade);
    });

    // Process remaining SELL trades that don't have matching BUY trades
    const unmatchedSellTrades = sellTrades.slice(buyTrades.length);
    unmatchedSellTrades.forEach((sellTrade) => {
      processedTrades.push(transformWebullTrade(sellTrade));
    });
  });

  console.log(`Finished processing ${processedTrades.length} trades`);
  return processedTrades;
}
