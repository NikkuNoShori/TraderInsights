import { useState } from "@/lib/react";
import type { Trade } from "@/types/trade";
import { TradeTable } from "./TradeTable";

interface TradeListProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
}

export function TradeList({ trades, onDelete }: TradeListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <TradeTable trades={paginatedTrades} onDelete={onDelete} />
    </div>
  );
}
