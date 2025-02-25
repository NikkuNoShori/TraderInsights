import { useEffect } from "@/lib/react";
import { useTradeStore } from "@/stores/tradeStore";
import { useAuthStore } from "@/stores/authStore";
import { PerformanceCharts } from "@/components/portfolio/PerformanceCharts";
import { TradeStatistics } from "@/components/dashboard/TradeStatistics";
import { PageHeader } from "@/components/ui";

interface PerformanceError extends Error {
  message: string;
  code?: string;
}

export default function Performance() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();

  useEffect(() => {
    if (user) {
      fetchTrades(user.id);
    }
  }, [user, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <PageHeader
        title="Performance Analysis"
        subtitle="Analyze your trading performance and metrics"
      />

      <div className="mt-6 space-y-6">
        <PerformanceCharts trades={trades} />
        <TradeStatistics trades={trades} />
      </div>
    </div>
  );
}
