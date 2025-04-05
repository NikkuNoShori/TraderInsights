import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useBrokerDataStore } from "@/stores/brokerDataStore";
import { useAuthStore } from "@/stores/authStore";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { RefreshCw, AlertCircle, Upload, Plus, LineChart } from "lucide-react";
import { toast } from "react-hot-toast";
import { PositionsGridCard } from "@/components/dashboard/PositionsGridCard";
import { PositionPerformanceCard } from "@/components/dashboard/PositionPerformanceCard";
import { PositionDistributionCard } from "@/components/dashboard/PositionDistributionCard";
import { CashVsInvestedCard } from "@/components/dashboard/CashVsInvestedCard";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { BrokerCard } from "@/components/dashboard/BrokerCard";
import { formatCurrency } from "@/utils/formatters";
import { formatDistanceToNow } from "date-fns";
import { ImportTradeForm } from "@/components/trades/ImportTradeForm";

// Define the tabs for the Trade Hub
type TradeHubTab = 'overview' | 'connect-broker' | 'import-trades' | 'manual-entry';

export default function TradeHub() {
  const location = useLocation();
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
  const [activeTab, setActiveTab] = useState<TradeHubTab>('overview');

  // Set the active tab based on location state if provided
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab as TradeHubTab);
    }
  }, [location.state]);

  // Initialize data on component mount
  useEffect(() => {
    if (user) {
      syncAllData().catch(err => {
        console.error("Failed to sync broker data:", err);
        // Don't show error toast for "No user registered" as this is expected for new users
        if (!err.message?.includes("No user registered")) {
          toast.error("Failed to load broker data. Please try again.");
        }
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
      toast.success("Data refreshed successfully");
    } catch (err) {
      console.error("Failed to refresh data:", err);
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

  // Handle import completion
  const handleImportComplete = async (trades: any[]) => {
    toast.success(`Successfully imported ${trades.length} trades`);
    // Additional logic for handling imported trades
  };

  // Render account selector
  const renderAccountSelector = () => {
    if (accounts.length === 0) {
      return (
        <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <span>No broker accounts found. Connect a broker to view your positions and trades.</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            You can connect a broker, import trades manually, or add trades one by one.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setActiveTab('connect-broker')}
            >
              Connect Broker
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('import-trades')}
            >
              Import Trades
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('manual-entry')}
            >
              Add Trade
            </Button>
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

  // Render connect broker tab content
  const renderConnectBrokerTab = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Connect Your Broker</h2>
        <p className="mb-4">Connect your brokerage account to automatically import your trades, positions, and balances.</p>
        
        <div className="p-6 border rounded-lg bg-card mb-6">
          <h3 className="text-lg font-medium mb-2">Getting Started</h3>
          <p className="mb-4">To connect your broker account, you'll need to:</p>
          <ol className="list-decimal pl-5 space-y-2 mb-4">
            <li>Select your broker from the options below</li>
            <li>Complete the authentication process</li>
            <li>Grant permission to access your account data</li>
          </ol>
          <p className="text-sm text-muted-foreground">Your data is securely stored and never shared with third parties.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors">
            <div className="font-medium text-lg mb-2">Robinhood</div>
            <p className="text-sm text-muted-foreground mb-4">Connect your Robinhood account to sync trades and positions.</p>
            <Button variant="outline" className="w-full">Connect</Button>
          </div>
          
          <div className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors">
            <div className="font-medium text-lg mb-2">TD Ameritrade</div>
            <p className="text-sm text-muted-foreground mb-4">Connect your TD Ameritrade account to sync trades and positions.</p>
            <Button variant="outline" className="w-full">Connect</Button>
          </div>
          
          <div className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors">
            <div className="font-medium text-lg mb-2">Interactive Brokers</div>
            <p className="text-sm text-muted-foreground mb-4">Connect your Interactive Brokers account to sync trades and positions.</p>
            <Button variant="outline" className="w-full">Connect</Button>
          </div>
        </div>
      </div>
    );
  };

  // Render import trades tab content
  const renderImportTradesTab = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Import Trades</h2>
        <p className="mb-4">Upload a CSV or Excel file with your trades to import them into your account.</p>
        
        <div className="p-6 border rounded-lg bg-card">
          <ImportTradeForm 
            onClose={() => setActiveTab('overview')} 
            onImportComplete={handleImportComplete} 
          />
        </div>
      </div>
    );
  };

  // Render manual entry tab content
  const renderManualEntryTab = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Manually Enter Trade</h2>
        <p className="mb-4">Enter trade details manually to add them to your account.</p>
        
        {/* Placeholder for the manual trade entry form */}
        <div className="p-6 border rounded-lg bg-card">
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Symbol</label>
                <input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. AAPL" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Trade Type</label>
                <select className="w-full p-2 border rounded mt-1">
                  <option>Buy</option>
                  <option>Sell</option>
                  <option>Short</option>
                  <option>Cover</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <input type="number" className="w-full p-2 border rounded mt-1" placeholder="Number of shares" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Price</label>
                <input type="number" className="w-full p-2 border rounded mt-1" placeholder="Price per share" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Date</label>
                <input type="date" className="w-full p-2 border rounded mt-1" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Source</label>
                <select className="w-full p-2 border rounded mt-1">
                  <option>Manual Entry</option>
                  <option>Paper Trading</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Notes</label>
              <textarea className="w-full p-2 border rounded mt-1" rows={3} placeholder="Add notes about this trade..."></textarea>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => setActiveTab('overview')}
              >
                Cancel
              </Button>
              <Button type="submit">Save Trade</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Trade Hub</h1>
          <p className="text-muted-foreground">Manage your broker connections, trades, and positions</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab('connect-broker')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Connect Broker
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveTab('import-trades')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Trades
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setActiveTab('manual-entry')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TradeHubTab)}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <LineChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="connect-broker">
            <Plus className="h-4 w-4 mr-2" />
            Connect Broker
          </TabsTrigger>
          <TabsTrigger value="import-trades">
            <Upload className="h-4 w-4 mr-2" />
            Import Trades
          </TabsTrigger>
          <TabsTrigger value="manual-entry">
            <Plus className="h-4 w-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderAccountSelector()}
          {renderAccountOverview()}
          {renderPositionsSection()}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {renderPositionPerformanceSection()}
            {renderPositionDistributionSection()}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {renderCashVsInvestedSection()}
            {renderOrdersSection()}
          </div>
        </TabsContent>
        
        <TabsContent value="connect-broker">
          {renderConnectBrokerTab()}
        </TabsContent>
        
        <TabsContent value="import-trades">
          {renderImportTradesTab()}
        </TabsContent>
        
        <TabsContent value="manual-entry">
          {renderManualEntryTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
} 