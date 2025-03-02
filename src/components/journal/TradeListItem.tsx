import { useState, useMemo } from "@/lib/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import type { Trade } from "@/types/trade";
import { calculateTradeMetrics } from "@/utils/calculateTradeMetrics";

interface TradeListItemProps {
  trade: Trade;
  onDelete?: (id: string) => void;
}

interface TradeMetrics {
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  profitRatio?: number;
}

export function TradeListItem({ trade }: TradeListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const metrics = useMemo(
    (): TradeMetrics => calculateTradeMetrics(trade),
    [trade],
  );
  const returnPercent =
    metrics.pnl && metrics.entryPrice && metrics.quantity
      ? (metrics.pnl / (metrics.entryPrice * metrics.quantity)) * 100
      : 0;

  return (
    <div className="border-b border-slate-700/50 last:border-0">
      <div
        className="flex items-center justify-between p-4 hover:bg-card/50 cursor-pointer transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <FontAwesomeIcon
            icon={isExpanded ? faChevronDown : faChevronRight}
            className="text-text-muted w-4"
          />
          <span
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium",
              trade.status === "pending"
                ? "bg-yellow-500/10 text-yellow-500"
                : trade.status === "open"
                  ? "bg-blue-500/10 text-blue-500"
                  : trade.side === "Long"
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500",
            )}
          >
            {trade.status === "pending"
              ? "PENDING"
              : trade.status === "open"
                ? "OPEN"
                : trade.side.toUpperCase()}
          </span>
          <div className="flex items-center space-x-6">
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">SYMBOL</span>
              <span className="font-medium">{trade.symbol}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">TYPE</span>
              <span>{trade.type}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-muted">DATE</span>
              <span>{trade.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-sm">
            <span className="text-text-muted mr-2">Size:</span>
            {metrics.quantity.toLocaleString()}
          </div>
          <div className="text-sm">
            <span className="text-text-muted mr-2">Entry:</span>
            {formatCurrency(metrics.entryPrice)}
          </div>
          {metrics.exitPrice && (
            <div className="text-sm">
              <span className="text-text-muted mr-2">Exit:</span>
              {formatCurrency(metrics.exitPrice)}
            </div>
          )}
          {metrics.pnl !== undefined && (
            <>
              <div
                className={cn(
                  "text-sm font-medium",
                  metrics.pnl > 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {formatCurrency(metrics.pnl)}
              </div>
              <div
                className={cn(
                  "text-sm",
                  metrics.pnl > 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {returnPercent.toFixed(2)}%
              </div>
            </>
          )}
          {trade.strategy && (
            <div className="text-sm text-text-muted">{trade.strategy}</div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-card/30 border-t border-slate-700/50">
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-text-muted mb-2">
                  Risk Management
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">
                      Risk/Reward:
                    </span>
                    <span className="text-sm">
                      {metrics.profitRatio?.toFixed(2) || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-text-muted">Fees:</span>
                    <span className="text-sm">
                      {trade.fees ? formatCurrency(trade.fees) : "N/A"}
                    </span>
                  </div>
                  {trade.stop_loss && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">
                        Stop Loss:
                      </span>
                      <span className="text-sm">
                        {formatCurrency(trade.stop_loss)}
                      </span>
                    </div>
                  )}
                  {trade.take_profit && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">
                        Take Profit:
                      </span>
                      <span className="text-sm">
                        {formatCurrency(trade.take_profit)}
                      </span>
                    </div>
                  )}
                  {trade.risk_amount && (
                    <div className="flex justify-between">
                      <span className="text-sm text-text-muted">
                        Risk Amount:
                      </span>
                      <span className="text-sm">
                        {formatCurrency(trade.risk_amount)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {trade.notes && (
                <div className="col-span-full mt-4">
                  <h4 className="text-sm font-medium text-text-muted mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-text-muted bg-card/50 p-4 rounded-lg">
                    {trade.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
