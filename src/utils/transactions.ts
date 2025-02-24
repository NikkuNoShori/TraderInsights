import type { Transaction } from "../types/transaction";

export interface TransactionOrder {
  action: "buy" | "sell";
  quantity: number;
  price: number;
}

export const calculateTransactionStatus = (
  transaction: Transaction,
  order: TransactionOrder
): Transaction => {
  // Since Transaction interface doesn't have orders array, we'll calculate based on current order
  const isEntryOrder =
    (transaction.side === "Long" && order.action === "buy") ||
    (transaction.side === "Short" && order.action === "sell");

  const isExitOrder =
    (transaction.side === "Long" && order.action === "sell") ||
    (transaction.side === "Short" && order.action === "buy");

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
