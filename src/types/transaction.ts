export type TransactionType = "stock" | "option";
export type TransactionSide = "Long" | "Short";
export type TransactionStatus = "open" | "closed" | "pending";

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  time: string;
  symbol: string;
  type: TransactionType;
  side: TransactionSide;
  quantity: number;
  price: number;
  total: number;
  status?: TransactionStatus;
  notes?: string;
  chart_image?: string;
  created_at: string;
}

export type NewTransaction = Omit<Transaction, "id" | "user_id" | "created_at">;
