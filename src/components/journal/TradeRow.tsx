import { useState } from "@/lib/react";
import { ChevronDown, ChevronRight, Trash2, Edit } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Trade, TradeSide } from "@/types/trade";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";

interface TradeRowProps {
  trade: Trade;
  onDelete?: (id: string) => void;
  onEdit?: (trade: Trade) => void;
}

export function TradeRow({ trade, onDelete, onEdit }: TradeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDelete && trade.id) {
      onDelete(trade.id);
    }
  };

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(trade);
    }
  };

  const handleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleRowClick = () => {
    if (trade.id) {
      navigate(`/app/journal/trades/${trade.id}`);
    }
  };

  const getSideStyles = (side: TradeSide) => {
    return side === "Long"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
  };

  return (
    <>
      <div
        className="flex items-center justify-between p-3 bg-card dark:bg-dark-paper rounded-lg hover:bg-muted/50 dark:hover:bg-dark-muted/20 cursor-pointer"
        onClick={handleRowClick}
      >
        {/* Expand/Collapse */}
        <button
          onClick={handleExpand}
          className="p-1 hover:bg-muted dark:hover:bg-dark-muted rounded"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Symbol and Type */}
        <div className="flex items-center space-x-3">
          <span
            className={cn(
              "px-2 py-1 text-xs rounded",
              getSideStyles(trade.side),
            )}
          >
            {trade.side}
          </span>
          <span className="font-medium">{trade.symbol}</span>
        </div>

        {/* Trade Details */}
        <div className="flex items-center space-x-8">
          <div className="text-sm">
            <span className="text-muted-foreground">Qty:</span> {trade.quantity}
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Entry:</span>{" "}
            {formatCurrency(trade.entry_price)}
          </div>
          {trade.exit_price && (
            <div className="text-sm">
              <span className="text-muted-foreground">Exit:</span>{" "}
              {formatCurrency(trade.exit_price)}
            </div>
          )}
          {trade.pnl !== undefined && (
            <div
              className={cn(
                "text-sm font-medium",
                trade.pnl >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {formatCurrency(trade.pnl)}
            </div>
          )}
        </div>

        {/* Date and Actions */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {formatDate(trade.entry_date)}
          </span>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-muted-foreground hover:text-blue-500 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-muted-foreground hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-muted/50 dark:bg-dark-muted/20 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Strategy
              </div>
              <div className="mt-1 text-sm">{trade.strategy || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Risk/Reward
              </div>
              <div className="mt-1 text-sm">
                {trade.risk_reward?.toFixed(2) || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Notes
              </div>
              <div className="mt-1 text-sm">{trade.notes || "No notes"}</div>
            </div>
            {Array.isArray(trade.tags) && trade.tags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Tags
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {trade.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded bg-muted dark:bg-dark-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
