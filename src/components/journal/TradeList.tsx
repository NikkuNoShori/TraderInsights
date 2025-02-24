import { TradeListItem } from "./TradeListItem";
import type { Trade } from "../../types/trade";

interface TradeListProps {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export function TradeList({ trades, onDelete }: TradeListProps) {
  if (!trades.length) {
    return (
      <div className="text-center py-6 text-text-muted">
        No trades found. Add your first trade to get started.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
      {trades.map((trade) => (
        <TradeListItem key={trade.id} trade={trade} onDelete={onDelete} />
      ))}
    </div>
  );
}
