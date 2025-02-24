import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/formatters";
import type { Trade } from "../../types/trade";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";

interface RecentTradesCardProps {
  trades: Trade[];
  className?: string;
}

export function RecentTradesCard({ trades, className }: RecentTradesCardProps) {
  return (
    <div className={cn("rounded-lg p-6", className)}>
      <h3 className="text-lg font-medium text-text-primary mb-4">
        Recent Trades
      </h3>
      <div className="space-y-4">
        {trades.length === 0 ? (
          <p className="text-text-muted text-sm">No recent trades</p>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {trades.map((trade) => {
              const isProfitable = (trade.pnl || 0) > 0;
              return (
                <div
                  key={trade.id}
                  className="py-3 flex items-center justify-between group hover:bg-card/50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        isProfitable ? "bg-green-500/10" : "bg-red-500/10",
                      )}
                    >
                      <FontAwesomeIcon
                        icon={isProfitable ? faArrowUp : faArrowDown}
                        className={cn(
                          "w-4 h-4",
                          isProfitable ? "text-green-500" : "text-red-500",
                        )}
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-text-primary">
                          {trade.symbol}
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-xs",
                            trade.side === "Long"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500",
                          )}
                        >
                          {trade.side.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-text-muted">
                        {new Date(trade.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div
                        className={cn(
                          "font-medium",
                          isProfitable ? "text-green-500" : "text-red-500",
                        )}
                      >
                        {formatCurrency(trade.pnl || 0)}
                      </div>
                      <div className="text-sm text-text-muted">
                        {trade.quantity}{" "}
                        {trade.type === "stock" ? "shares" : "contracts"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
