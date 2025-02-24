import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { useTrade } from "../hooks/useTrade";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { formatDate, formatCurrency } from "../utils/formatters";
import type { Trade } from "../types/trade";

export function TradeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: trade, isLoading, error } = useTrade(id);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading trade: {error.message}</div>;
  if (!trade) return <div>Trade not found</div>;

  return (
    <div className="p-6">
      <PageHeader
        title={`${trade.symbol} Trade Details`}
        subtitle={`${trade.side} trade on ${formatDate(trade.date)}`}
        actions={
          <button
            onClick={() => navigate("/journal")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Journal
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-dark-paper rounded-lg p-6 border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-4">Trade Information</h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-muted-foreground">Symbol</dt>
              <dd className="text-foreground">{trade.symbol}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Type</dt>
              <dd className="text-foreground capitalize">{trade.type}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Side</dt>
              <dd className="text-foreground">{trade.side}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Quantity</dt>
              <dd className="text-foreground">{trade.quantity}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Entry Price</dt>
              <dd className="text-foreground">{formatCurrency(trade.entry_price)}</dd>
            </div>
            {trade.exit_price && (
              <div>
                <dt className="text-sm text-muted-foreground">Exit Price</dt>
                <dd className="text-foreground">{formatCurrency(trade.exit_price)}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="text-foreground capitalize">{trade.status}</dd>
            </div>
            {trade.pnl !== undefined && (
              <div>
                <dt className="text-sm text-muted-foreground">P&L</dt>
                <dd className={`text-foreground ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(trade.pnl)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {trade.notes && (
          <div className="bg-card dark:bg-dark-paper rounded-lg p-6 border border-border dark:border-dark-border">
            <h3 className="text-lg font-medium mb-4">Notes</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{trade.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
