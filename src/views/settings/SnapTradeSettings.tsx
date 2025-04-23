import { getSnapTradeConfig } from '@/lib/snaptrade/config';
import { SnapTradeClient } from '@/lib/snaptrade/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function SnapTradeSettings() {
  const config = getSnapTradeConfig();
  const [clientId, setClientId] = useState(config.clientId || '');
  const [consumerKey, setConsumerKey] = useState(config.consumerKey || '');
  const snapTradeClient = new SnapTradeClient({ ...config, clientId, consumerKey });

  const handleSave = async () => {
    try {
      await snapTradeClient.initialize();
      toast.success('SnapTrade configuration saved successfully');
    } catch (error) {
      console.error('Failed to save SnapTrade configuration:', error);
      toast.error('Failed to save SnapTrade configuration');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SnapTrade Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter your SnapTrade Client ID"
            />
          </div>
          <div>
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input
              id="consumerKey"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              placeholder="Enter your SnapTrade Consumer Key"
            />
          </div>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Connection Status</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${config.clientId && config.consumerKey ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">
              {config.clientId && config.consumerKey ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={async () => {
              try {
                await snapTradeClient.initialize();
                toast.success('Connection test successful');
              } catch (error) {
                console.error('Failed to test connection:', error);
                toast.error('Failed to test connection');
              }
            }}
          >
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 