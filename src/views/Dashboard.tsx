import { useEffect } from "@/lib/react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { useAuthStore } from "@/stores/authStore";
import { useTradeStore } from "@/stores/tradeStore";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();

  useEffect(() => {
    if (user) {
      fetchTrades(user.id);
    }
  }, [user, fetchTrades]);

  return (
    <div className="flex-grow p-6">
      <WelcomeSection />
      <div className="mt-6">
        <DashboardCards trades={trades} />
      </div>
    </div>
  );
}
