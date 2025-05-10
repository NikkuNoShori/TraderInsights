import { useEffect } from "@/lib/react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useAuthStore } from "@/stores/authStore";
import { useTradeStore } from "@/stores/tradeStore";
import { FilterBar } from "@/components/trades/FilterBar";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useFilterStore } from "@/stores/filterStore";
import { PageHeader } from "@/components/ui";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ArrowRight, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();
  const { filters } = useFilterStore();
  const filteredTrades = useFilteredTrades(trades);

  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Overview of your trading performance" />
        <FilterBar />
      </div>
      <div className="space-y-6">
        <DashboardCards trades={filteredTrades} timeframe={filters.timeframe || "1M"} />
      </div>
    </div>
  );
}
