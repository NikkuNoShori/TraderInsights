import { Trade } from "@/types/trade";
import { TradeRow } from "@/components/journal/TradeRow";
import { Pagination } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui";
import { TradeListItem } from "./TradeListItem";
import { Button } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TradeListProps {
  trades: Trade[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TradeList({
  trades,
  isLoading,
  onDelete,
  onEdit,
  currentPage,
  totalPages,
  onPageChange,
}: TradeListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trades found. Add your first trade to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {trades.map((trade) => (
          <TradeRow
            key={trade.id}
            trade={trade}
            onDelete={onDelete}
            onEdit={() => onEdit(trade)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
