import { useEffect, useState } from 'react';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export default function SnapTradeDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const snapTradeClient = new SnapTradeClient(getSnapTradeConfig());

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      if (snapTradeClient.isUserRegistered()) {
        const conns = await snapTradeClient.getConnections();
        setConnections(conns);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (authorizationId: string) => {
    try {
      setIsLoading(true);
      await snapTradeClient.deleteConnection(authorizationId);
      await loadConnections();
      toast.success('Successfully disconnected from brokerage');
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect from brokerage');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Brokerages</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-4">
            {connections.map((conn) => (
              <div key={conn.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{conn.brokerageName}</h3>
                  <p className="text-sm text-muted-foreground">Status: {conn.status}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleDisconnect(conn.id)}
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No connected brokerages</p>
        )}
      </CardContent>
    </Card>
  );
} 