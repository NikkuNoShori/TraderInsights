import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { useState, type FC } from "@/lib/react";
import { Trade, formatTradeValue } from "@/types/trade";

interface TradeEntryProps {
  trade: Trade;
  onDelete: (id: string) => void;
  onRetry?: () => void;
}

export const TradeEntry: FC<TradeEntryProps> = ({
  trade,
  onDelete,
  onRetry,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await onDelete(trade.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete trade");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;
    try {
      setError(null);
      await onRetry();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to retry operation",
      );
    }
  };

  const renderOptionDetails = () => {
    if (trade.type !== "option" || !trade.option_details) return null;

    const { strike, expiration, contract_type } = trade.option_details;

    return (
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Strike</div>
          <div>{formatTradeValue(strike)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Expiration
          </div>
          <div>{format(new Date(expiration), "MMM d, yyyy")}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
          <div className="capitalize">{contract_type}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-4 relative">
      {error && (
        <div
          className="absolute inset-0 bg-red-50 dark:bg-red-900/20 rounded-lg 
                      flex flex-col items-center justify-center p-4"
        >
          <div className="text-red-800 dark:text-red-200 text-sm mb-2">
            {error}
          </div>
          {onRetry && (
            <button
              onClick={handleRetry}
              className="text-sm text-red-700 dark:text-red-300 
                       hover:text-red-800 dark:hover:text-red-200"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {isDeleting && (
        <div className="absolute inset-0 bg-gray-50/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center">
          <Loader2 className="h-6 w-6 text-primary-500 animate-spin" />
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium">{trade.symbol}</span>
            <span
              className={`text-sm px-2 py-1 rounded ${
                trade.side === "Long"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {trade.side}
            </span>
            <span className="text-sm text-gray-500">
              {trade.type === "option" ? "Option" : "Stock"}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(trade.date), "MMM d, yyyy")} at {trade.time}
          </div>
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`text-gray-400 hover:text-red-500 transition-colors ${
            isDeleting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Quantity
          </div>
          <div>{trade.quantity}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
          <div>{formatTradeValue(trade.price)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
          <div>{formatTradeValue(trade.total)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
          <div className="capitalize">{trade.status}</div>
        </div>
      </div>

      {renderOptionDetails()}

      {trade.notes && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">Notes</div>
          <div className="text-sm">{trade.notes}</div>
        </div>
      )}
    </div>
  );
};
