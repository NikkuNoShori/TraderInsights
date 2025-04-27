import { useEffect } from "@/lib/react";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import { useAuthStore } from "@/stores/authStore";
import { useTradeStore } from "@/stores/tradeStore";
import { FilterBar } from "@/components/trades/FilterBar";
import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { useFilterStore } from "@/stores/filterStore";
import { PageHeader } from "@/components/ui";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { ArrowRight, Plus } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { trades, fetchTrades } = useTradeStore();
  const { filters } = useFilterStore();
  const { connections, accounts, isLoading, error } = useBrokerDataStore();
  const filteredTrades = useFilteredTrades(trades);

  useEffect(() => {
    if (user?.id) {
      fetchTrades(user.id);
    }
  }, [user?.id, fetchTrades]);

  const renderBrokerSection = () => {
    if (isLoading) {
      return (
        <div className="mb-6 p-4 border border-border rounded-lg bg-card">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="mb-6 p-4 border border-destructive/20 rounded-lg bg-destructive/10">
          <h3 className="font-medium text-destructive mb-1">Connection Error</h3>
          <p className="text-sm text-destructive/80">{error.message || String(error)}</p>
          <Button variant="outline" className="mt-2" onClick={() => window.location.href = '/app/broker-dashboard'}>
            Try Again
          </Button>
        </div>
      );
    }

    if (!connections.length) {
      return (
        <div className="mb-6 p-6 border border-border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-2">Connect Your Broker</h3>
          <p className="text-muted-foreground mb-4">
            Connect your brokerage account to automatically import your trades and track your portfolio performance.
          </p>
          {!connections.length && (
            <Button onClick={() => window.location.href = '/app/broker-dashboard'} className="inline-flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Connect Broker
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="mb-6 p-6 border border-border rounded-lg bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Connected Brokers</h3>
            <p className="text-muted-foreground">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} connected
            </p>
          </div>
          {connections.length > 0 && (
            <Button variant="outline" onClick={() => window.location.href = '/app/broker-dashboard'} className="inline-flex items-center">
              Manage Brokers
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection: any) => (
            <div key={connection.id} className="p-4 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                {connection.brokerLogo && (
                  <img
                    src={connection.brokerLogo}
                    alt={connection.brokerName}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div>
                  <h4 className="font-medium">{connection.brokerName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {connection.accounts?.length || 0} account{connection.accounts?.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-grow p-6">
      <div className="flex items-center justify-between mb-6">
        <PageHeader title="Dashboard" subtitle="Overview of your trading performance" />
        <FilterBar />
      </div>
      {renderBrokerSection()}
      <div className="space-y-6">
        <DashboardCards trades={filteredTrades} timeframe={filters.timeframe || "1M"} />
      </div>
    </div>
  );
}
