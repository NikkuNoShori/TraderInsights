import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/formatters";
import type { Trade } from "@/types/trade";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { WinRateChart } from "./WinRateChart";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";

interface RecentTradesCardProps {
  trades: Trade[];
  timeframe: TimeframeOption;
  className?: string;
}

export function RecentTradesCard({ trades, timeframe, className }: RecentTradesCardProps) {
  return (
    <div className={cn("bg-card dark:bg-dark-paper p-4 rounded-lg border border-border dark:border-dark-border", className)}>
      <h3 className="text-lg font-medium mb-3">Recent Trades</h3>
      <WinRateChart trades={trades} timeframe={timeframe} />
    </div>
  );
}
