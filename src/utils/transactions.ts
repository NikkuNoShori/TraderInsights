import type { Transaction } from "@/types/transaction";
import type { Trade, TradeSide } from "@/types/trade";

export interface TransactionOrder {
  action: "buy" | "sell";
  quantity: number;
  price: number;
}

export const getTransactionStatus = (trade: Trade): "open" | "closed" => {
  if (!trade.exit_date) {
    return "open";
  }
  return "closed";
};

export const calculateTransactionValue = (trade: Trade): number => {
  return trade.quantity * trade.price;
};

export const calculateTransactionPnL = (trade: Trade): number => {
  if (!trade.exit_date || !trade.exit_price) {
    return 0;
  }

  const entryValue = trade.quantity * trade.price;
  const exitValue = trade.quantity * trade.exit_price;

  return trade.side === ("long" as TradeSide)
    ? exitValue - entryValue
    : entryValue - exitValue;
};

export const calculateTransactionROI = (trade: Trade): number => {
  if (!trade.exit_date || !trade.exit_price) {
    return 0;
  }

  const pnl = calculateTransactionPnL(trade);
  const entryValue = trade.quantity * trade.price;

  return (pnl / entryValue) * 100;
};

export const calculateTransactionStatus = (
  transaction: Transaction,
  order: TransactionOrder
): Transaction => {
  // Since Transaction interface doesn't have orders array, we'll calculate based on current order
  const isEntryOrder =
    (transaction.side === "Long" && order.action === "buy") ||
    (transaction.side === "Short" && order.action === "sell");

  // Calculate remaining quantity based on the new order
  const remainingQuantity = isEntryOrder
    ? transaction.quantity + order.quantity
    : Math.max(transaction.quantity - order.quantity, 0);

  // Update transaction status
  const status = remainingQuantity === 0 ? "closed" : "open";

  return {
    ...transaction,
    quantity: isEntryOrder
      ? transaction.quantity + order.quantity
      : transaction.quantity,
    price: isEntryOrder
      ? (transaction.price * transaction.quantity +
          order.price * order.quantity) /
        (transaction.quantity + order.quantity)
      : transaction.price,
    status,
  };
};
