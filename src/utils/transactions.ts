import type { Transaction } from "../types/transaction";

export const calculateTransactionStatus = (
  transaction: Transaction,
): Transaction => {
  const orders = [...(transaction.orders || []), order];

  // Calculate total quantities and average prices
  const entryOrders = orders.filter(
    (o) =>
      (transaction.side === "Long" && o.action === "buy") ||
      (transaction.side === "Short" && o.action === "sell"),
  );

  const exitOrders = orders.filter(
    (o) =>
      (transaction.side === "Long" && o.action === "sell") ||
      (transaction.side === "Short" && o.action === "buy"),
  );

  const totalEntryQuantity = entryOrders.reduce(
    (sum, o) => sum + o.quantity,
    0,
  );

  const totalExitQuantity = exitOrders.reduce((sum, o) => sum + o.quantity, 0);

  const avgEntryPrice =
    entryOrders.length > 0
      ? entryOrders.reduce((sum, o) => sum + o.price * o.quantity, 0) /
        totalEntryQuantity
      : 0;

  const avgExitPrice =
    exitOrders.length > 0
      ? exitOrders.reduce((sum, o) => sum + o.price * o.quantity, 0) /
        totalExitQuantity
      : 0;

  return {
    ...transaction,
    avgEntryPrice,
    avgExitPrice,
    status: totalExitQuantity >= transaction.quantity ? "closed" : "open",
    remainingQuantity: Math.max(transaction.quantity - totalExitQuantity, 0),
  };
};
