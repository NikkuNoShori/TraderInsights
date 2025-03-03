import type { WebullTrade } from "@/services/webullService";
import type {
  Trade,
  TradeType,
  TradeSide,
  TradeStatus,
  CreateTradeData,
} from "@/types/trade";

export function transformWebullTrade(
  webullTrade: WebullTrade,
): CreateTradeData {
  // Map Webull action to our TradeSide
  const side: TradeSide = webullTrade.action === "BUY" ? "Long" : "Short";

  // For single trades, we'll mark them as open by default
  // Matching with exit trades will be handled in transformWebullTrades
  const status: TradeStatus = "open";

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

  return trade;
}

export function transformWebullTrades(
  webullTrades: WebullTrade[],
): CreateTradeData[] {
  console.log("Starting trade transformation with trades:", webullTrades);

  // Sort all trades by createTime first
  const sortedTrades = [...webullTrades].sort(
    (a, b) =>
      new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
  );

  // Group trades by symbol to find matching pairs
  const tradeGroups = new Map<string, WebullTrade[]>();
  sortedTrades.forEach((trade) => {
    const existingTrades = tradeGroups.get(trade.symbol) || [];
    tradeGroups.set(trade.symbol, [...existingTrades, trade]);
  });

  const processedTrades: CreateTradeData[] = [];

  // Process each group of trades by symbol
  tradeGroups.forEach((trades, symbol) => {
    console.log(`Processing trades for symbol ${symbol}...`);

    // Separate BUY and SELL trades
    const buyTrades = trades.filter((t) => t.action === "BUY");
    const sellTrades = trades.filter((t) => t.action === "SELL");

    console.log(
      `Found ${buyTrades.length} BUY trades and ${sellTrades.length} SELL trades for ${symbol}`,
    );

    // Process each BUY trade
    buyTrades.forEach((buyTrade) => {
      const processedTrade = transformWebullTrade(buyTrade);

      // Look for a matching SELL trade with the same quantity
      const matchingSellIndex = sellTrades.findIndex(
        (sell) =>
          (sell.filledQuantity || sell.quantity) ===
            (buyTrade.filledQuantity || buyTrade.quantity) &&
          new Date(sell.createTime) > new Date(buyTrade.createTime),
      );

      if (matchingSellIndex !== -1) {
        const matchingSellTrade = sellTrades[matchingSellIndex];
        console.log(
          `Found matching SELL trade for BUY trade ${buyTrade.orderId} -> ${matchingSellTrade.orderId}`,
        );

        // Set exit information
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

        // Update notes with matching order info
        processedTrade.notes += `\nMatching Sell Order ID: ${matchingSellTrade.orderId}`;

        // Remove the used sell trade
        sellTrades.splice(matchingSellIndex, 1);
      }

      processedTrades.push(processedTrade);
    });

    // Process remaining SELL trades as potential exits for previously imported trades
    sellTrades.forEach((sellTrade) => {
      const processedTrade = transformWebullTrade(sellTrade);
      // Mark these as closed since they represent exits
      processedTrade.status = "closed";
      processedTrade.exit_date = processedTrade.date;
      processedTrade.exit_time = processedTrade.time;
      processedTrade.exit_timestamp = processedTrade.timestamp;
      processedTrade.exit_price = sellTrade.filledPrice || sellTrade.price;
      processedTrades.push(processedTrade);
    });
  });

  console.log(`Processed ${processedTrades.length} trades`);
  return processedTrades;
}
