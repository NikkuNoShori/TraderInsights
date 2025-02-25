import type { Trade } from "@/types/trade";
import { TradeTable } from "./TradeTable";

interface TradeListProps {
  trades: Trade[];
  onDelete?: (id: string) => void;
  onEdit?: (trade: Trade) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function TradeList({
  trades,
  onDelete,
  onEdit,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}: TradeListProps) {
  return (
    <div className="space-y-4">
      <TradeTable
        trades={trades}
        onDelete={onDelete}
        onEdit={onEdit}
        isLoading={isLoading}
      />
      {totalPages > 1 && onPageChange && (
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`mx-1 px-3 py-1 rounded ${
                page === currentPage
                  ? "bg-primary text-white"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
