import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, RefreshCw, AlertCircle, InfoIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SnapTradeCredentials } from '@/stores/authStore';
import { ErrorMessage } from '@/components/ui/error-message';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SnapTradeReact } from 'snaptrade-react';
import useSnapTradeMessages, { ErrorData } from '@/hooks/useSnapTradeMessages';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { toast } from '@/components/ui/toast';

// Helper to mask sensitive data
const maskId = (id: string | null | undefined) => {
  if (!id) return '';
  // Only show first 8 chars of the ID
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
};

// Type for broker data
interface Broker {
  id: string;
  name: string;
  slug: string;
}

interface SnapTradeConnectionProps {
  /**
   * Whether to lazy-load broker data or initialize immediately
   * Set to true to delay loading until the component is needed
   */
  lazyLoad?: boolean;
}

export function SnapTradeConnection({ lazyLoad = false }: SnapTradeConnectionProps): JSX.Element {
  const { 
    user, 
    snapTradeCredentials, 
    setSnapTradeCredentials, 
    saveSnapTradeCredentials, 
    removeSnapTradeCredentials,
    fetchSnapTradeCredentials
  } = useAuthStore();
  const [status, setStatus] = useState<'not_registered' | 'registering' | 'registered' | 'error'>('not_registered');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBrokers, setIsFetchingBrokers] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!lazyLoad);
  
  // State for available brokers
  const [availableBrokers, setAvailableBrokers] = useState<Broker[]>([]);
  
  // State for SnapTradeReact modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [redirectUri, setRedirectUri] = useState<string | null>(null);
  const [lastConnectedBroker, setLastConnectedBroker] = useState<string | null>(null);
  
  // Use ref to track initialization state and prevent duplicate fetches
  const initializeRef = useRef<{
    credentialsFetched: boolean;
    brokersFetched: boolean;
  }>({
    credentialsFetched: false,
    brokersFetched: false,
  });
  
  // Initialize the component when needed
  const initialize = () => {
    if (!isInitialized) {
      console.log('Initializing SnapTradeConnection component');
      setIsInitialized(true);
    }
  };
  
  // Fetch SnapTrade credentials on component mount
  useEffect(() => {
    // Skip if lazy loading and not initialized
    if (!isInitialized) return;
    
    if (user?.id && !snapTradeCredentials && !initializeRef.current.credentialsFetched) {
      // Set flag to prevent duplicate fetches
      initializeRef.current.credentialsFetched = true;
      console.log('Fetching credentials for user:', user.id);
      fetchSnapTradeCredentials(user.id);
    }
  }, [user, snapTradeCredentials, fetchSnapTradeCredentials, isInitialized]);

  // Update status when credentials change
  useEffect(() => {
    // Skip if lazy loading and not initialized
    if (!isInitialized) return;
    
    if (snapTradeCredentials) {
      setStatus('registered');
      // Only fetch brokers if we don't already have them and haven't tried fetching yet
      if (availableBrokers.length === 0 && !initializeRef.current.brokersFetched) {
        // Set flag to prevent duplicate fetches
        initializeRef.current.brokersFetched = true;
        console.log('Fetching brokers on credentials change');
        fetchAvailableBrokers();
      }
    } else {
      setStatus('not_registered');
    }
  }, [snapTradeCredentials, availableBrokers.length, isInitialized]);

  // Fetch available brokers from SnapTrade
  const fetchAvailableBrokers = async () => {
    if (!snapTradeCredentials) return;
    
    try {
      setIsFetchingBrokers(true);
      setError(null);
      
      // Create a client instance - use import.meta.env for client-side code
      // IMPORTANT: import.meta.env is available in Vite client code, process.env is not
      const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
      const consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
      
      if (!clientId || !consumerKey) {
        console.error('Missing SnapTrade API credentials in client environment');
        throw new Error('Missing SnapTrade API credentials');
      }
      
      // Log that we have the credentials (don't log actual values)
      console.log('SnapTrade credentials available:', {
        hasClientId: !!clientId,
        hasConsumerKey: !!consumerKey,
      });
      
      // Prefer using the proxy for better security and reliability
      try {
        // First try to get brokerages via our server-side proxy
        console.log('Fetching brokerages via proxy');
        const response = await fetch('/api/snaptrade/proxy/brokerages', {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch brokerages: ${response.status}`);
        }
        
        const brokerages = await response.json();
        console.log('Available brokerages:', brokerages);
        
        // Map to our broker format
        const mappedBrokers: Broker[] = (brokerages || []).map((broker: any) => ({
          id: broker.id,
          name: broker.name,
          slug: broker.name.replace(/\s+/g, '_').toUpperCase(),
        }));
        
        setAvailableBrokers(mappedBrokers);
      } catch (proxyError) {
        console.error('Error fetching via proxy, falling back to direct SDK:', proxyError);
        
        // Fall back to direct SDK if proxy fails
        const client = new SnapTradeClient({ clientId, consumerKey });
        const brokerages = await client.getBrokerages();
        
        // Map to our broker format
        const mappedBrokers: Broker[] = (brokerages || []).map((broker: any) => ({
          id: broker.id,
          name: broker.name,
          slug: broker.name.replace(/\s+/g, '_').toUpperCase(),
        }));
        
        setAvailableBrokers(mappedBrokers);
      }
    } catch (error) {
      console.error('Error fetching brokerages:', error);
      setError('Failed to fetch available brokers. Please try again later.');
    } finally {
      setIsFetchingBrokers(false);
    }
  };

  // Register with SnapTrade (direct API call)
  const handleRegister = async () => {
    if (!user || !user.id) return;
    
    setStatus('registering');
    setError(null);
    
    try {
      // Use server API endpoint
      console.log("Registering user with SnapTrade:", user.id);
      const response = await fetch('/api/snaptrade/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      const data = await response.json();
      console.log("Registration response:", data);
      
      // Check if request was not successful
      if (!response.ok) {
        console.error("Registration failed:", data);
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      // Check if this is a "user already exists" response
      if (data.warning && data.warning.includes('already exists')) {
        console.log('User already exists in SnapTrade - continuing with connection');
        setStatus('registered');
        setError("Your account is already registered with SnapTrade. You can proceed to connect brokers.");
        
        // Store the credentials even for existing users if we have them
        if (data.userId && data.userSecret) {
          // Create credentials object with proper typing
          const credentials: SnapTradeCredentials = {
            userId: String(data.userId),
            userSecret: data.userSecret
          };
          
          // Save to Supabase and local state
          await saveSnapTradeCredentials(credentials);
        } else {
          // Try to fetch existing credentials
          await fetchSnapTradeCredentials(user.id);
        }
        return;
      }
      
      if (!data.userId || !data.userSecret) {
        throw new Error('Invalid response from SnapTrade - missing userId or userSecret');
      }
      
      // Create credentials object with proper typing
      const snapTradeCredentials = {
        userId: String(data.userId),
        userSecret: data.userSecret
      };
      
      // Save to Supabase and local state
      await saveSnapTradeCredentials(snapTradeCredentials);
      setStatus('registered');
      
      // Now that we are registered, fetch available brokers
      fetchAvailableBrokers();
    } catch (err: any) {
      console.error('Registration error:', err);
      // Check for specific error types
      let errorMessage = err.message || 'Registration failed';
      
      // Check if error contains details about API error
      if (err.details?.detail) {
        errorMessage = `SnapTrade API Error: ${err.details.detail}`;
      }
      
      setError(errorMessage);
      setStatus('error');
    }
  };

  // Unlink SnapTrade credentials
  const handleUnlink = async () => {
    try {
      // Remove from Supabase and local state
      await removeSnapTradeCredentials();
      setStatus('not_registered');
      setAvailableBrokers([]);
    } catch (err: any) {
      setError(err.message || 'Failed to unlink SnapTrade account');
    }
  };

  // Connect to a brokerage using the SnapTradeReact modal
  const connectBrokerage = async (broker?: string) => {
    if (!snapTradeCredentials) {
      setError('You need to be registered with SnapTrade to connect a brokerage.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { userId, userSecret } = snapTradeCredentials;
      
      // Store the broker being connected for later reference
      setLastConnectedBroker(broker || 'ALL');
      
      console.log("Connecting broker:", { 
        userId: maskId(userId), 
        broker: broker || "ALL",
        hasUserSecret: !!userSecret
      });
      
      try {
        // Use the proxy instead of a dedicated endpoint
        const response = await fetch('/api/snaptrade/proxy/snapTrade/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId,
            userSecret,
            clientId: import.meta.env.VITE_SNAPTRADE_CLIENT_ID,
            connectionType: "trade",
            redirectUri: `${window.location.origin}/broker-callback`,
            broker,
            timestamp: Date.now(),
          }),
        });
        
        if (!response.ok) {
          const responseData = await response.json();
          console.error("Broker connect failed:", responseData);
          throw new Error(responseData.error || responseData.message || 'Connection failed');
        }
        
        const responseData = await response.json();
        
        console.log("Broker connect response:", {
          status: response.status,
          hasRedirectUri: !!responseData.redirectUri,
        });
        
        // Check for redirect URI
        const uri = responseData.redirectUri || responseData.redirectURI;
        
        if (!uri) {
          throw new Error('No redirect URI returned from SnapTrade API');
        }
        
        // Set the redirect URI
        setRedirectUri(uri);
        
        // Open the redirect URI in a new tab
        console.log(`Opening broker connection URL in new tab: ${uri.substring(0, 30)}...`);
        window.open(uri, '_blank');
        
        // Allow some time for user to see the message before resetting state
        setTimeout(() => {
          setIsLoading(false);
          toast.success('Broker connection window opened. Please complete the authorization process.');
        }, 1000);
        
        return;
      } catch (error) {
        console.error("Error connecting broker:", error);
        setError('Failed to connect broker. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Broker connection error:", error);
      setError('Failed to connect broker. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle successful connection
  const handleConnectionSuccess = (authorizationId: string) => {
    console.log('Successfully connected brokerage with authorization ID:', authorizationId);
    setIsModalOpen(false);
    setRedirectUri(null);
    
    // Show success message
    setError(`Successfully connected to ${lastConnectedBroker === 'ALL' ? 'broker' : lastConnectedBroker}! Authorization ID: ${authorizationId.substring(0, 8)}...`);
  };

  // Handle connection error
  const handleConnectionError = (data: any) => {
    console.error('Connection error:', data);
    setIsModalOpen(false);
    setRedirectUri(null);
    setError(`Connection error: ${data.message || 'Unknown error'}`);
  };

  // Force refresh brokers after a successful connection
  const refreshBrokers = () => {
    initializeRef.current.brokersFetched = false;
    fetchAvailableBrokers();
  };

  // Render different content based on status
  const renderContent = () => {
    // If lazy loading and not initialized, show initialize button
    if (lazyLoad && !isInitialized) {
      return (
        <div className="text-center p-4">
          <Button onClick={initialize}>
            Load Broker Connection
          </Button>
        </div>
      );
    }

    // If not registered, show registration button
    if (status === 'not_registered' || status === 'error') {
      return (
        <div className="space-y-4">
          {error && (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center">
            <Button 
              onClick={handleRegister} 
              disabled={isLoading || !user} 
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Connect to SnapTrade
            </Button>
          </div>
        </div>
      );
    }

    // If registering, show loading state
    if (status === 'registering') {
      return (
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Registering with SnapTrade...</p>
        </div>
      );
    }

    // If registered, show broker connection options
    if (status === 'registered') {
      return (
        <div className="space-y-4">
          {error && error.includes("successfully") ? (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
              <InfoIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">{error}</AlertDescription>
            </Alert>
          ) : error ? (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base">Select a Brokerage to Connect</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshBrokers}
                  disabled={isFetchingBrokers}
                  className="h-8 w-8"
                  title="Refresh broker list"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetchingBrokers ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Refresh</span>
                </Button>
              </CardHeader>
              <CardContent>
                {isFetchingBrokers ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : availableBrokers.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {availableBrokers.map(broker => (
                      <Button
                        key={broker.id}
                        variant="outline"
                        className="w-full flex items-center justify-between py-3 px-4 text-left h-auto"
                        onClick={() => connectBrokerage(broker.id)}
                        disabled={isLoading}
                      >
                        <span className="font-medium">{broker.name}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No brokers available
                  </div>
                )}
                
                {/* General broker connection option - this is a valid SnapTrade feature that allows users 
                    to see SnapTrade's full broker selection UI instead of our specific list */}
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={() => connectBrokerage()}
                    disabled={isLoading}
                    className="text-sm"
                  >
                    {isLoading ? 
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                      <ExternalLink className="mr-2 h-4 w-4" />
                    }
                    Connect Any Broker
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-4">
                <Button variant="outline" size="sm" onClick={handleUnlink}>
                  Unlink SnapTrade
                </Button>
                <div className="text-xs text-muted-foreground">
                  Account ID: {maskId(snapTradeCredentials?.userId)}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      );
    }

    // Fallback content
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          Reload Page
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
}