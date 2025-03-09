import type { Trade } from "@/types/trade";
import { useMemo } from "@/lib/react";
import { StatsCard } from "./StatsCard";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Receipt,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { WinRateChart } from "./WinRateChart";
import { RechartsPnLChart } from "./RechartsPnLChart";
import { TradeDistributionChart } from "./TradeDistributionChart";
import { MarketOverviewCard } from "./MarketOverviewCard";
import { StockInfoCard } from "./StockInfoCard";
import { TechnicalAnalysisCard } from "./TechnicalAnalysisCard";
import type { TimeframeOption } from "@/components/ui/timeframeSelector";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface DashboardCardsProps {
  trades: Trade[];
  timeframe: TimeframeOption;
}

export function DashboardCards({ trades, timeframe }: DashboardCardsProps) {
  const filteredTrades = useFilteredTrades(trades);

  const stats = useMemo(() => {
    if (filteredTrades.length === 0) {
      return {
        rawPnL: 0,
        totalFees: 0,
        netReturn: 0,
        winRate: 0,
        totalTrades: 0,
      };
    }

    // Calculate raw P&L without fees
    const rawPnL = filteredTrades.reduce((sum, trade) => {
      if (trade.exit_price && trade.entry_price) {
        const tradePnL =
          trade.side === "Long"
            ? (trade.exit_price - trade.entry_price) * trade.quantity
            : (trade.entry_price - trade.exit_price) * trade.quantity;
        return sum + tradePnL;
      }
      return sum;
    }, 0);

    // Calculate total fees
    const totalFees = filteredTrades.reduce(
      (sum, trade) => sum + (trade.fees || 0),
      0,
    );

    // Calculate net return (P&L - fees)
    const netReturn = rawPnL - totalFees;

    const winningTrades = filteredTrades.filter((trade) => {
      if (trade.exit_price && trade.entry_price) {
        const tradePnL =
          trade.side === "Long"
            ? (trade.exit_price - trade.entry_price) * trade.quantity
            : (trade.entry_price - trade.exit_price) * trade.quantity;
        return tradePnL > 0;
      }
      return false;
    });

    const winRate =
      filteredTrades.length > 0
        ? (winningTrades.length / filteredTrades.length) * 100
        : 0;

    return {
      rawPnL,
      totalFees,
      netReturn,
      winRate,
      totalTrades: filteredTrades.length,
    };
  }, [filteredTrades]);

  const renderEmptyState = () => (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard
          title="P&L"
          value="--"
          icon={TrendingUp}
          subtitle="No trades yet"
        />
        <StatsCard
          title="Total Fees"
          value="--"
          icon={Receipt}
          subtitle="No trades yet"
        />
        <StatsCard
          title="Net Return"
          value="--"
          icon={DollarSign}
          subtitle="No trades yet"
        />
        <StatsCard
          title="Win Rate"
          value="--"
          icon={Activity}
          subtitle="No trades yet"
        />
        <StatsCard
          title="Total Trades"
          value="0"
          icon={Activity}
          subtitle="No trades yet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-4">Win Rate Over Time</h3>
          <WinRateChart trades={[]} timeframe={timeframe} height={DASHBOARD_CHART_HEIGHT} />
        </div>
        <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-4">P&L Over Time</h3>
          <RechartsPnLChart trades={[]} timeframe={timeframe} height={DASHBOARD_CHART_HEIGHT} />
        </div>
      </div>

      <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
        <h3 className="text-lg font-medium mb-4">Trade Distribution</h3>
        <TradeDistributionChart trades={[]} height={DASHBOARD_CHART_HEIGHT} />
      </div>

      <MarketOverviewCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockInfoCard />
        <TechnicalAnalysisCard />
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <StatsCard
          title="P&L"
          value={formatCurrency(stats.rawPnL)}
          icon={stats.rawPnL >= 0 ? TrendingUp : TrendingDown}
          trend={formatCurrency(Math.abs(stats.rawPnL))}
          trendDirection={stats.rawPnL >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Total Fees"
          value={formatCurrency(stats.totalFees)}
          icon={Receipt}
          className="text-muted-foreground"
        />
        <StatsCard
          title="Net Return"
          value={formatCurrency(stats.netReturn)}
          icon={DollarSign}
          trend={formatCurrency(Math.abs(stats.netReturn))}
          trendDirection={stats.netReturn >= 0 ? "up" : "down"}
        />
        <StatsCard
          title="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={Activity}
          trend={`${stats.winRate.toFixed(1)}%`}
          trendDirection={stats.winRate >= 50 ? "up" : "down"}
        />
        <StatsCard
          title="Total Trades"
          value={stats.totalTrades.toString()}
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-4">Win Rate Over Time</h3>
          <WinRateChart trades={filteredTrades} timeframe={timeframe} height={DASHBOARD_CHART_HEIGHT} />
        </div>
        <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
          <h3 className="text-lg font-medium mb-4">P&L Over Time</h3>
          <RechartsPnLChart trades={filteredTrades} timeframe={timeframe} height={DASHBOARD_CHART_HEIGHT} />
        </div>
      </div>

      <div className="bg-card dark:bg-dark-paper p-6 rounded-lg border border-border dark:border-dark-border">
        <h3 className="text-lg font-medium mb-4">Trade Distribution</h3>
        <TradeDistributionChart trades={filteredTrades} height={DASHBOARD_CHART_HEIGHT} />
      </div>

      <MarketOverviewCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockInfoCard />
        <TechnicalAnalysisCard />
      </div>
    </div>
  );

  return filteredTrades.length === 0 ? renderEmptyState() : renderStats();
}
