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
    <div>
      <WelcomeSection />
      <div className="max-w-screen-2xl mx-auto py-8">
        <DashboardCards trades={trades} />
      </div>
    </div>
  );
}
