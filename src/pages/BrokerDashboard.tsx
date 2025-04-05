import { useEffect, useState } from "react";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui";
import { RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { PositionsGridCard } from "@/components/dashboard/PositionsGridCard";
import { PositionPerformanceCard } from "@/components/dashboard/PositionPerformanceCard";
import { PositionDistributionCard } from "@/components/dashboard/PositionDistributionCard";
import { CashVsInvestedCard } from "@/components/dashboard/CashVsInvestedCard";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { BrokerCard } from "@/components/dashboard/BrokerCard";
import { formatCurrency } from "@/utils/formatters";
import { formatDistanceToNow } from "date-fns";

export default function BrokerDashboard() {
  const { user } = useAuthStore();
  const { 
    connections, 
    accounts, 
    positions, 
    balances, 
    orders, 
    isLoading, 
    error, 
    lastSyncTime,
    syncAllData 
  } = useBrokerDataStore();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      syncAllData().catch(err => {
        console.error("Failed to sync broker data:", err);
        toast.error("Failed to load broker data. Please try again.");
      });
    }
  }, [user, syncAllData]);

  // Set the first account as selected if none is selected
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Handle account selection
  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  // Handle data refresh
  const handleRefresh = async () => {
    try {
      await syncAllData();
      toast.success("Broker data refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh broker data:", err);
      toast.error("Failed to refresh data. Please try again.");
    }
  };

  // Get account balances
  const getAccountBalances = (accountId: string) => {
    return balances[accountId] || [];
  };

  // Get account positions
  const getAccountPositions = (accountId: string) => {
    return positions[accountId] || [];
  };

  // Get account orders
  const getAccountOrders = (accountId: string) => {
    return orders[accountId] || [];
  };

  // Calculate total portfolio value
  const calculatePortfolioValue = (accountId: string) => {
    const accountBalances = getAccountBalances(accountId);
    const totalBalance = accountBalances.reduce((sum, balance) => sum + balance.totalValue, 0);
    return totalBalance;
  };

  // Calculate total cash
  const calculateTotalCash = (accountId: string) => {
    const accountBalances = getAccountBalances(accountId);
    const totalCash = accountBalances.reduce((sum, balance) => sum + balance.cash, 0);
    return totalCash;
  };

  // Calculate total buying power
  const calculateBuyingPower = (accountId: string) => {
    const accountBalances = getAccountBalances(accountId);
    const totalBuyingPower = accountBalances.reduce((sum, balance) => sum + balance.buyingPower, 0);
    return totalBuyingPower;
  };

  // Render account selector
  const renderAccountSelector = () => {
    if (accounts.length === 0) {
      return (
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <span>No accounts found. Please connect a broker account.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium">Select Account</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {lastSyncTime ? `Last updated ${formatDistanceToNow(new Date(lastSyncTime))} ago` : "Never updated"}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedAccountId === account.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleAccountChange(account.id)}
            >
              <div className="font-medium">{account.name}</div>
              <div className="text-sm text-muted-foreground">{account.type}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render account overview cards
  const renderAccountOverview = () => {
    if (!selectedAccountId) return null;

    const portfolioValue = calculatePortfolioValue(selectedAccountId);
    const totalCash = calculateTotalCash(selectedAccountId);
    const buyingPower = calculateBuyingPower(selectedAccountId);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BrokerCard
          title="Portfolio Value"
          description="Total value of all positions and cash"
          accountId={selectedAccountId}
          error={error}
        >
          <div className="text-2xl font-bold">{formatCurrency(portfolioValue)}</div>
        </BrokerCard>

        <BrokerCard
          title="Cash Balance"
          description="Available cash in the account"
          accountId={selectedAccountId}
          error={error}
        >
          <div className="text-2xl font-bold">{formatCurrency(totalCash)}</div>
        </BrokerCard>

        <BrokerCard
          title="Buying Power"
          description="Total buying power available"
          accountId={selectedAccountId}
          error={error}
        >
          <div className="text-2xl font-bold">{formatCurrency(buyingPower)}</div>
        </BrokerCard>

        <BrokerCard
          title="Day Trading Status"
          description="Current day trading status"
          accountId={selectedAccountId}
          error={error}
        >
          <div className="text-2xl font-bold">Active</div>
          <div className="text-sm text-muted-foreground">No restrictions</div>
        </BrokerCard>
      </div>
    );
  };

  // Render positions section
  const renderPositionsSection = () => {
    if (!selectedAccountId) return null;
    
    return (
      <div className="mb-6">
        <PositionsGridCard accountId={selectedAccountId} />
      </div>
    );
  };

  // Render position performance section
  const renderPositionPerformanceSection = () => {
    if (!selectedAccountId) return null;
    
    return (
      <div className="mb-6">
        <PositionPerformanceCard accountId={selectedAccountId} />
      </div>
    );
  };

  // Render position distribution section
  const renderPositionDistributionSection = () => {
    if (!selectedAccountId) return null;
    
    return (
      <div className="mb-6">
        <PositionDistributionCard accountId={selectedAccountId} />
      </div>
    );
  };

  // Render cash vs invested section
  const renderCashVsInvestedSection = () => {
    if (!selectedAccountId) return null;
    
    return (
      <div className="mb-6">
        <CashVsInvestedCard accountId={selectedAccountId} />
      </div>
    );
  };

  // Render orders section
  const renderOrdersSection = () => {
    if (!selectedAccountId) return null;
    
    return (
      <div className="mb-6">
        <RecentOrdersCard accountId={selectedAccountId} />
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Broker Dashboard</h1>
        <p className="text-muted-foreground">
          View and manage your broker accounts and positions
        </p>
      </div>

      {renderAccountSelector()}
      
      {selectedAccountId && (
        <>
          {renderAccountOverview()}
          {renderPositionsSection()}
          {renderPositionPerformanceSection()}
          {renderPositionDistributionSection()}
          {renderCashVsInvestedSection()}
          {renderOrdersSection()}
        </>
      )}
    </div>
  );
} 