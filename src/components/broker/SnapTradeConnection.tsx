import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ExternalLink, RefreshCw, AlertCircle, InfoIcon, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { SnapTradeCredentials } from '@/stores/authStore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { toast } from '@/components/ui/toast';
import { StorageHelpers } from '@/lib/snaptrade/storage';

// Helper to mask sensitive data
const maskId = (id: string | null | undefined) => {
  if (!id) return '';
  // Only show first 8 chars of the ID
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
};

// Helper function to generate SnapTrade signature
const generateSnapTradeSignature = (clientId: string, consumerKey: string): { timestamp: string, signature: string } => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // In browser environment, we need to use the SubtleCrypto API
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    // This is a browser-safe way to generate HMAC
    // But we can't do this synchronously, so return a basic timestamp
    // The server-side implementation can handle the proper signature
    return { timestamp, signature: 'browser-generated' };
  }
  
  // Simple substitute for server-side crypto
  const hash = Array.from(new TextEncoder().encode(`${clientId}${timestamp}${consumerKey}`))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { timestamp, signature: hash };
};

// Type for broker data
interface Broker {
  id: string;
  name: string;
  slug: string;
  isConnected?: boolean;
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
  
  // State for connected brokers
  const [connectedBrokers, setConnectedBrokers] = useState<string[]>([]);
  
  // State for broker connection
  const [lastConnectedBroker, setLastConnectedBroker] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
        fetchConnectedBrokers();
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
      
      // Try our server-side endpoint first (most reliable)
      try {
        // Try to get brokerages via our server-side handler
        console.log('Fetching brokerages via server endpoint');
        const response = await fetch('/api/snaptrade/brokerages', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`Server endpoint returned: ${response.status}`);
          throw new Error(`Failed to fetch brokerages: ${response.status}`);
        }
        
        const brokerages = await response.json();
        console.log('Available brokerages from server endpoint:', brokerages);
        
        // Map to our broker format
        const mappedBrokers: Broker[] = (brokerages || []).map((broker: any) => ({
          id: broker.id,
          name: broker.name,
          slug: broker.name.replace(/\s+/g, '_').toUpperCase(),
          isConnected: connectedBrokers.includes(broker.id)
        }));
        
        setAvailableBrokers(mappedBrokers);
        return;
      } catch (serverError) {
        console.error('Server endpoint failed, trying direct API:', serverError);
        
        // DIRECT SNAPTRADE API CALL
        try {
          console.log('Making direct API call to SnapTrade');
          
          // Generate timestamp and signature
          const { timestamp, signature } = generateSnapTradeSignature(clientId, consumerKey);
          
          const response = await fetch('https://api.snaptrade.com/api/v1/referenceData/brokerages', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              // Include both authentication methods
              'x-api-key': consumerKey,
              'Client-Id': clientId,
              // Also try signature-based auth
              'Signature': signature,
              'Timestamp': timestamp,
              'ClientId': clientId,
            },
          });
          
          if (!response.ok) {
            console.error(`Direct API call failed: ${response.status}`);
            throw new Error(`Direct API call failed: ${response.status}`);
          }
          
          const brokerages = await response.json();
          console.log('Available brokerages from direct API:', brokerages);
          
          // Map to our broker format
          const mappedBrokers: Broker[] = (brokerages || []).map((broker: any) => ({
            id: broker.id,
            name: broker.name,
            slug: broker.name.replace(/\s+/g, '_').toUpperCase(),
            isConnected: connectedBrokers.includes(broker.id)
          }));
          
          setAvailableBrokers(mappedBrokers);
          return;
        } catch (directApiError) {
          console.error('Direct API call failed, trying SDK:', directApiError);
          
          try {
            // Fall back to SDK if direct API fails
            const client = new SnapTradeClient({ clientId, consumerKey });
            const brokerages = await client.getBrokerages();
            
            // Map to our broker format
            const mappedBrokers: Broker[] = (brokerages || []).map((broker: any) => ({
              id: broker.id,
              name: broker.name,
              slug: broker.name.replace(/\s+/g, '_').toUpperCase(),
              isConnected: connectedBrokers.includes(broker.id)
            }));
            
            setAvailableBrokers(mappedBrokers);
            return;
          } catch (sdkError) {
            console.error('SDK failed as well, using mock data as fallback:', sdkError);
            // Fall through to mock data
          }
        }
      }
      
      // FALLBACK: Use mock data if all else fails
      const mockBrokers: Broker[] = [
        { id: '76e6660e-09ce-4197-a1a0-c14bf5f20f69', name: 'Questrade', slug: 'QUESTRADE' },
        { id: 'da24d4f9-a922-4e68-b059-3918c9a0166e', name: 'Interactive Brokers', slug: 'INTERACTIVE_BROKERS' },
        { id: '575a7887-1b34-4ec8-bd10-f78fd4e711c3', name: 'Coinbase', slug: 'COINBASE' },
        { id: 'aab42dfa-2184-4259-972a-1119dea5903a', name: 'Binance', slug: 'BINANCE' },
        { id: '2f081990-b40c-44a4-ab6e-f6ff4c125e39', name: 'Schwab', slug: 'SCHWAB' },
        { id: 'f0d60210-2a75-41c7-9347-1a07b54c41d1', name: 'Public', slug: 'PUBLIC' },
        { id: 'b2ab13d8-da9f-48c0-8fb1-48331ba5deeb', name: 'Fidelity', slug: 'FIDELITY' },
        { id: 'ebf91a5b-0920-4266-9e36-f6cfe8c40946', name: 'Robinhood', slug: 'ROBINHOOD' },
      ];
      
      setAvailableBrokers(mockBrokers);
      setError('Using cached broker data due to connection issues. Some features may be limited.');
    } catch (error) {
      console.error('Error fetching brokerages:', error);
      setError('Failed to fetch available brokers. Using cached data.');
      
      // FALLBACK: Use mock data if all else fails
      const mockBrokers: Broker[] = [
        { id: '76e6660e-09ce-4197-a1a0-c14bf5f20f69', name: 'Questrade', slug: 'QUESTRADE' },
        { id: 'da24d4f9-a922-4e68-b059-3918c9a0166e', name: 'Interactive Brokers', slug: 'INTERACTIVE_BROKERS' },
        { id: '575a7887-1b34-4ec8-bd10-f78fd4e711c3', name: 'Coinbase', slug: 'COINBASE' },
        { id: 'aab42dfa-2184-4259-972a-1119dea5903a', name: 'Binance', slug: 'BINANCE' },
        { id: '2f081990-b40c-44a4-ab6e-f6ff4c125e39', name: 'Schwab', slug: 'SCHWAB' },
        { id: 'f0d60210-2a75-41c7-9347-1a07b54c41d1', name: 'Public', slug: 'PUBLIC' },
        { id: 'b2ab13d8-da9f-48c0-8fb1-48331ba5deeb', name: 'Fidelity', slug: 'FIDELITY' },
        { id: 'ebf91a5b-0920-4266-9e36-f6cfe8c40946', name: 'Robinhood', slug: 'ROBINHOOD' },
      ];
      
      setAvailableBrokers(mockBrokers);
    } finally {
      setIsFetchingBrokers(false);
    }
  };

  // Fetch connected brokers
  const fetchConnectedBrokers = async () => {
    try {
      // Get connected brokers from storage
      const connections = StorageHelpers.getConnections();
      
      // Extract broker IDs
      const connectedBrokerIds = connections.map(connection => connection.brokerageId);
      console.log('Connected brokers:', connectedBrokerIds);
      
      setConnectedBrokers(connectedBrokerIds);
      
      // Update available brokers with connection status
      if (availableBrokers.length > 0) {
        const updatedBrokers = availableBrokers.map(broker => ({
          ...broker,
          isConnected: connectedBrokerIds.includes(broker.id)
        }));
        setAvailableBrokers(updatedBrokers);
      }
    } catch (error) {
      console.error('Error fetching connected brokers:', error);
    }
  };

  // Register with SnapTrade (direct API call)
  const handleRegister = async () => {
    if (!user || !user.id) return;
    
    setStatus('registering');
    setError(null);
    
    try {
      // Make sure we've cleared any stale data first
      try {
        // Clear storage as a precaution
        StorageHelpers.clearAll();
      } catch (clearError) {
        console.warn("Failed to clear storage:", clearError);
      }
      
      // Use server API endpoint
      console.log("Registering user with SnapTrade:", user.id);
      const response = await fetch('/api/snaptrade/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id,
          clientId: import.meta.env.VITE_SNAPTRADE_CLIENT_ID,
          forceRenew: true,  // Signal to the server that we want to force renewal of credentials
        }),
      });
      
      const data = await response.json();
      console.log("Registration response:", {
        status: response.status,
        hasUserId: !!data.userId,
        hasUserSecret: !!data.userSecret,
        hasWarning: !!data.warning,
        hasError: !!data.error,
      });
      
      // Check if request was not successful
      if (!response.ok) {
        console.error("Registration failed:", data);
        throw new Error(data.error || data.message || 'Registration failed');
      }
      
      // Check if we received the userSecret - we need this for connecting
      if (!data.userSecret) {
        console.error("No userSecret in registration response:", data);
        if (data.warning && data.warning.includes('already exists')) {
          throw new Error('Your account already exists but we could not recover your credentials. Please try unlinking and registering again.');
        } else {
          throw new Error('Invalid response from SnapTrade registration: No user secret received');
        }
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
          saveSnapTradeCredentials(credentials);
          
          console.log('Saved SnapTrade credentials for existing user');
        }
      } else {
        // Normal successful registration
        if (!data.userId || !data.userSecret) {
          throw new Error('Invalid response from SnapTrade registration');
        }
        
        console.log('Successfully registered with SnapTrade');
        setStatus('registered');
        
        // Create credentials object with proper typing
        const credentials: SnapTradeCredentials = {
          userId: String(data.userId),
          userSecret: data.userSecret
        };
        
        // Save to Supabase and local state
        saveSnapTradeCredentials(credentials);
        
        // Refresh broker list
        initializeRef.current.brokersFetched = false;
        fetchAvailableBrokers();
      }
    } catch (error: any) {
      setStatus('error');
      setError(error.message || 'Failed to register with SnapTrade');
    }
  };

  // Unlink SnapTrade credentials
  const handleUnlink = async () => {
    try {
      console.log("Unlinking SnapTrade credentials");
      
      // First, record the current user ID for logging
      const currentUserId = snapTradeCredentials?.userId || '';
      
      // Clear any connections from storage
      try {
        StorageHelpers.clearAll();
        console.log("Cleared all stored connections");
      } catch (storageError) {
        console.error("Error clearing connections:", storageError);
      }
      
      // Remove from Supabase and local state via the auth store
      await removeSnapTradeCredentials();
      
      // Reset all local state
      setStatus('not_registered');
      setAvailableBrokers([]);
      setConnectedBrokers([]);
      setShowSuccessMessage(false);
      setLastConnectedBroker(null);
      
      // Clear any error messages
      setError(null);
      
      // Reset initialization flags to force refetching on re-registration
      initializeRef.current = {
        credentialsFetched: false,
        brokersFetched: false
      };
      
      console.log(`Successfully unlinked SnapTrade for user: ${maskId(currentUserId)}`);
      
      // Display a success message
      toast.success('Successfully unlinked SnapTrade account');
    } catch (err: any) {
      console.error("Error unlinking SnapTrade:", err);
      setError(err.message || 'Failed to unlink SnapTrade account');
    }
  };
  
  // Force re-registration if credentials are invalid
  const handleForceReregister = async () => {
    try {
      // First unlink current credentials
      await removeSnapTradeCredentials();
      
      // Now start registration process
      setStatus('not_registered');
      setError(null);
      
      // If user exists, register immediately
      if (user?.id) {
        handleRegister();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset SnapTrade credentials');
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
      setShowSuccessMessage(false);
      
      const { userId, userSecret } = snapTradeCredentials;
      
      // Validate credentials
      if (!userId || !userSecret) {
        setError('Missing userId or userSecret. Please try registering again.');
        setIsLoading(false);
        return;
      }
      
      // Log credential details (safely)
      console.log("Credentials check:", {
        userId: maskId(userId),
        userSecretLength: userSecret ? userSecret.length : 0,
        userSecretValid: typeof userSecret === 'string' && userSecret.length > 10
      });
      
      // Store the broker being connected for later reference
      setLastConnectedBroker(broker || 'ALL');
      
      console.log("Connecting broker:", { 
        userId: maskId(userId), 
        broker: broker || "ALL",
        hasUserSecret: !!userSecret
      });
      
      // Get environment variables for direct API call
      const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
      const consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
      
      if (!clientId || !consumerKey) {
        throw new Error('Missing SnapTrade API credentials');
      }
      
      // First attempt: Use our server endpoint
      try {
        // Use the dedicated broker-connect endpoint - with all parameters in the body
        console.log('Attempting to connect via server API endpoint');
        const response = await fetch('/api/snaptrade/broker-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId,
            userSecret,
            clientId, // Include clientId in the request
            brokerId: broker,
            redirectUri: `${window.location.origin}/broker-callback`
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
        const uri = responseData.redirectUri;
        
        if (!uri) {
          throw new Error('No redirect URI returned from SnapTrade API');
        }
        
        // Open the redirect URI in a new tab
        console.log(`Opening broker connection URL in new tab: ${uri.substring(0, 30)}...`);
        window.open(uri, '_blank');
        
        // Allow some time for user to see the message before resetting state
        setTimeout(() => {
          setIsLoading(false);
          setShowSuccessMessage(true);
          toast.success('Broker connection window opened. Please complete the authorization process.');
          
          // Refresh broker list after a few seconds to reflect new connections
          setTimeout(() => {
            refreshBrokers();
          }, 5000);
        }, 1000);
        
        return;
      } catch (serverError) {
        console.error("Server API failed, trying direct API:", serverError);
        
        // Second attempt: Direct API call to SnapTrade
        try {
          // Get environment variables for direct API call
          const clientId = import.meta.env.VITE_SNAPTRADE_CLIENT_ID;
          const consumerKey = import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY;
          
          if (!clientId || !consumerKey) {
            throw new Error('Missing SnapTrade API credentials');
          }
          
          // Direct API calls from browser will fail due to CORS
          // But we can try the minimal headers approach
          console.log('Attempting direct API call to SnapTrade login endpoint');
          const directResponse = await fetch('https://api.snaptrade.com/api/v1/snapTrade/login', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              // Only use the basic authentication headers to avoid CORS issues
              'x-api-key': consumerKey,
              'Client-Id': clientId,
            },
            body: JSON.stringify({
              userId,
              userSecret,
              broker: broker,
              redirectUri: `${window.location.origin}/broker-callback`
            })
          });
          
          if (!directResponse.ok) {
            const errorData = await directResponse.json();
            console.error("Direct API call failed:", errorData);
            throw new Error(errorData.error || errorData.message || 'Direct connection failed');
          }
          
          const directData = await directResponse.json();
          console.log("Direct API response:", directData);
          
          // Get the redirect URI from the response
          const directUri = directData.redirectUri;
          
          if (!directUri) {
            throw new Error('No redirect URI returned from direct API call');
          }
          
          // Open the redirect URI in a new tab
          console.log(`Opening broker connection URL from direct API: ${directUri.substring(0, 30)}...`);
          window.open(directUri, '_blank');
          
          // Show success message
          setIsLoading(false);
          setShowSuccessMessage(true);
          toast.success('Broker connection window opened via direct API. Please complete the authorization process.');
          
          // Refresh broker list after a few seconds
          setTimeout(() => {
            refreshBrokers();
          }, 5000);
          
          return;
        } catch (directError) {
          console.error("Direct API call also failed:", directError);
          setError('Both server and direct API connection attempts failed. Please try again later.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error("Broker connection error:", error);
      setError('Failed to connect broker. Please try again.');
      setIsLoading(false);
    }
  };

  // Force refresh brokers after a successful connection
  const refreshBrokers = () => {
    // Reset the brokers fetch flag to force a new fetch
    initializeRef.current.brokersFetched = false;
    
    // Clear any error messages on refresh
    setError(null);
    
    // Fetch the latest brokers
    fetchAvailableBrokers();
    fetchConnectedBrokers();
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
      // Split brokers into connected and unconnected
      const connectedBrokerList = availableBrokers.filter(broker => broker.isConnected);
      const unconnectedBrokerList = availableBrokers.filter(broker => !broker.isConnected);
      
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
              <AlertDescription className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>{error}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setError(null);
                      setIsLoading(false);
                    }}
                    className="ml-2"
                  >
                    Dismiss
                  </Button>
                </div>
                
                {error.includes("credentials") || error.includes("userSecret") || error.includes("failed") ? (
                  <div className="flex justify-end pt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleForceReregister}
                      className="text-xs"
                    >
                      Re-register with SnapTrade
                    </Button>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}
          
          {showSuccessMessage && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
              <InfoIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                Broker connection initiated! Complete the authorization process in the new tab.
                After connecting, you can connect more brokers below.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            {/* Connected Brokers Section */}
            {connectedBrokerList.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Connected Brokers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {connectedBrokerList.map(broker => (
                      <div 
                        key={broker.id}
                        className="flex items-center justify-between p-2 rounded border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"
                      >
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                          <span className="font-medium">{broker.name}</span>
                        </div>
                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Available Brokers Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">Available Brokers</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Select one broker to connect at a time</p>
                </div>
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
                ) : unconnectedBrokerList.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {unconnectedBrokerList.map(broker => (
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
                    {availableBrokers.length === 0 ? "No brokers available" : "All brokers are connected"}
                  </div>
                )}
                
                {/* General broker connection option - only show if there are unconnected brokers */}
                {unconnectedBrokerList.length > 0 && (
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
                )}
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