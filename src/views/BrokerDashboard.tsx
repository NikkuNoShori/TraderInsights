import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useBrokerDataStore } from '@/stores/brokerDataStore';
import { SnapTradeConnection } from '@/components/broker/SnapTradeConnection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { PositionsGridCard } from '@/components/dashboard/PositionsGridCard';
import { RecentOrdersCard } from '@/components/dashboard/RecentOrdersCard';
import { PositionDistributionCard } from '@/components/dashboard/PositionDistributionCard';
import { RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { ErrorMessage } from '@/components/ui/error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BrokerDashboard() {
  const { user, snapTradeCredentials } = useAuthStore();
  const { 
    accounts, 
    selectedAccountId, 
    selectAccount, 
    fetchAccounts, 
    fetchAccountData,
    isLoading,
    error
  } = useBrokerDataStore();
  
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [manualFetchTriggered, setManualFetchTriggered] = useState(false);
  
  // Don't automatically fetch accounts on component mount
  // This avoids the 401 errors when the user hasn't connected a broker yet
  
  // Add a manual fetch function that will be triggered by a button click
  const handleFetchAccounts = () => {
    if (user && snapTradeCredentials?.userId && snapTradeCredentials?.userSecret) {
      try {
        setConnectionAttempted(true);
        setManualFetchTriggered(true);
        fetchAccounts(snapTradeCredentials.userId, snapTradeCredentials.userSecret);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    }
  };
  
  useEffect(() => {
    // Only try to fetch account data if we have valid credentials and a selected account
    if (selectedAccountId && snapTradeCredentials?.userId && snapTradeCredentials?.userSecret) {
      fetchAccountData(
        selectedAccountId, 
        snapTradeCredentials.userId, 
        snapTradeCredentials.userSecret
      );
    }
  }, [selectedAccountId, snapTradeCredentials, fetchAccountData]);
  
  const handleRefresh = async () => {
    if (!snapTradeCredentials?.userId || !snapTradeCredentials?.userSecret || !selectedAccountId) return;
    
    setIsRefreshing(true);
    try {
      await fetchAccountData(
        selectedAccountId,
        snapTradeCredentials.userId,
        snapTradeCredentials.userSecret
      );
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleAccountChange = (accountId: string) => {
    selectAccount(accountId);
  };
  
  const renderAccountSelector = () => {
    if (isLoading && accounts.length === 0) {
      return <Skeleton className="h-10 w-[200px]" />;
    }
    
    if (accounts.length === 0) {
      return null;
    }
    
    return (
      <div className="flex items-center gap-4">
        <Select 
          value={selectedAccountId || undefined} 
          onValueChange={handleAccountChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>
                {account.name} ({account.number})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleRefresh} 
          disabled={isRefreshing || isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  };
  
  const renderContent = () => {
    // First, check if we have valid credentials
    if (!snapTradeCredentials?.userId || !snapTradeCredentials?.userSecret) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connect to SnapTrade</CardTitle>
            <CardDescription>
              You need to connect your account to SnapTrade before you can manage your brokerage accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="ml-2">
                SnapTrade allows you to connect to various brokerages and manage your investments in one place.
              </AlertDescription>
            </Alert>
            <SnapTradeConnection lazyLoad={false} />
          </CardContent>
        </Card>
      );
    }
    
    // Check if we have credentials but an error occurred during account fetch
    if (connectionAttempted && error && accounts.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connection Error</CardTitle>
            <CardDescription>
              There was a problem connecting to your brokerage accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="ml-2">
                {error || "We couldn't retrieve your accounts. Please try reconnecting your broker."}
              </AlertDescription>
            </Alert>
            <SnapTradeConnection lazyLoad={false} />
          </CardContent>
        </Card>
      );
    }
    
    // If we have credentials but no accounts yet, show connection card with fetch button
    if (accounts.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Connect a Brokerage</CardTitle>
            <CardDescription>
              Connect your brokerage account to view your holdings, positions, and transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                <SnapTradeConnection lazyLoad={false} />
                
                {snapTradeCredentials && manualFetchTriggered === false && (
                  <div className="mt-6 pt-4 border-t">
                    <Button 
                      onClick={handleFetchAccounts} 
                      className="w-full"
                    >
                      Check for Connected Accounts
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      );
    }
    
    if (!selectedAccountId) {
      return (
        <Card className="p-6">
          <div className="text-center py-8">
            <p>Please select an account to view details.</p>
          </div>
        </Card>
      );
    }
    
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>
                Details about your selected brokerage account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Account Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {accounts.find(a => a.id === selectedAccountId) && (
                      <>
                        <div>
                          <span className="text-sm text-muted-foreground">Account Name</span>
                          <p>{accounts.find(a => a.id === selectedAccountId)?.name}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Account Number</span>
                          <p>{accounts.find(a => a.id === selectedAccountId)?.number}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Type</span>
                          <p>{accounts.find(a => a.id === selectedAccountId)?.type}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Brokerage</span>
                          <p>{accounts.find(a => a.id === selectedAccountId)?.brokerageName}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="positions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Positions</CardTitle>
              <CardDescription>
                Your current investment positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Position data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your recent trading activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Order data will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Broker Dashboard</h1>
          <p className="text-muted-foreground">
            Connect and manage your brokerage accounts
          </p>
        </div>
        {renderAccountSelector()}
      </div>
      
      {error && accounts.length > 0 && <ErrorMessage message={error} className="mb-4" />}
      
      {renderContent()}
    </div>
  );
} 