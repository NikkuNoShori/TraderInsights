import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { getSnapTradeConfig } from '@/lib/snaptrade/config';

interface SnapTradeFormData {
  clientId: string;
  consumerKey: string;
}

export function SnapTradeSettings() {
  const config = getSnapTradeConfig();
  const { register, handleSubmit } = useForm<SnapTradeFormData>({
    defaultValues: {
      clientId: config.clientId || '',
      consumerKey: config.consumerKey || '',
    }
  });

  const onSubmit = async (data: SnapTradeFormData) => {
    // TODO: Implement SnapTrade settings update
    console.log('SnapTrade settings update:', data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SnapTrade Integration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">API Configuration</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                {...register('clientId')}
                placeholder="Enter your SnapTrade Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumerKey">Consumer Key</Label>
              <Input
                id="consumerKey"
                type="password"
                {...register('consumerKey')}
                placeholder="Enter your SnapTrade Consumer Key"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save API Settings</Button>
            </div>
          </form>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-2">Demo Mode</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Demo Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use SnapTrade in demo mode with simulated data
              </p>
            </div>
            <Switch
              checked={config.isDemo || false}
              onCheckedChange={() => {
                // TODO: Implement demo mode toggle
                console.log('Toggle demo mode');
              }}
            />
          </div>
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
            onClick={() => {
              // TODO: Implement connection test
              console.log('Test connection');
            }}
          >
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 