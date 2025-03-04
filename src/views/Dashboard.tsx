import { useEffect, useState } from "@/lib/react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useAuthStore } from "@/stores/authStore";
import { useTradeStore } from "@/stores/tradeStore";
import { TimeframeSelector } from "@/components/ui/TimeframeSelector";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import { PageHeader } from "@/components/ui";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();
  const [timeframe, setTimeframe] = useState<TimeframeOption>("1M");

  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Overview of your trading performance" />
        <TimeframeSelector value={timeframe} onValueChange={setTimeframe} className="w-32" />
      </div>
      <div className="space-y-6">
        <DashboardCards trades={trades} timeframe={timeframe} />
      </div>
    </div>
  );
}
