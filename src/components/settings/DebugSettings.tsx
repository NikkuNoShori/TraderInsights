import { useState } from 'react';
import { useDebugStore, DebugCategory, DebugLevel } from '@/stores/debugStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DEBUG_CATEGORIES: DebugCategory[] = [
  'broker',
  'api',
  'auth',
  'theme',
  'performance',
  'state'
];

const LOG_LEVELS: DebugLevel[] = ['debug', 'info', 'warn', 'error'];

export function DebugSettings() {
  const {
    isDebugMode,
    enabledCategories,
    minLogLevel,
    showDebugPanel,
    brokerDebug,
    apiDebug,
    toggleDebugMode,
    toggleCategory,
    setLogLevel,
    toggleDebugPanel,
    updateBrokerDebug,
    updateApiDebug,
  } = useDebugStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Debug Mode</Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable all debug features
            </p>
          </div>
          <Switch
            checked={isDebugMode}
            onCheckedChange={toggleDebugMode}
          />
        </div>

        {/* Debug Panel Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Debug Panel</Label>
            <p className="text-sm text-muted-foreground">
              Show or hide the debug information panel
            </p>
          </div>
          <Switch
            checked={showDebugPanel}
            onCheckedChange={toggleDebugPanel}
          />
        </div>

        {/* Log Level Selector */}
        <div className="space-y-2">
          <Label>Minimum Log Level</Label>
          <Select
            value={minLogLevel}
            onValueChange={(value: DebugLevel) => setLogLevel(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select log level" />
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Debug Categories */}
        <div className="space-y-2">
          <Label>Debug Categories</Label>
          <div className="flex flex-wrap gap-2">
            {DEBUG_CATEGORIES.map((category) => (
              <Button
                key={category}
                variant={enabledCategories.includes(category) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Button */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
        </Button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-6 pt-4 border-t">
            {/* Broker Debug Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Broker Debug Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Missing Brokers</Label>
                  <Switch
                    checked={brokerDebug.showMissingBrokers}
                    onCheckedChange={(checked) => 
                      updateBrokerDebug({ showMissingBrokers: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Broker Details</Label>
                  <Switch
                    checked={brokerDebug.showBrokerDetails}
                    onCheckedChange={(checked) => 
                      updateBrokerDebug({ showBrokerDetails: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Connection Status</Label>
                  <Switch
                    checked={brokerDebug.showConnectionStatus}
                    onCheckedChange={(checked) => 
                      updateBrokerDebug({ showConnectionStatus: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* API Debug Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">API Debug Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show API Requests</Label>
                  <Switch
                    checked={apiDebug.showRequests}
                    onCheckedChange={(checked) => 
                      updateApiDebug({ showRequests: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show API Responses</Label>
                  <Switch
                    checked={apiDebug.showResponses}
                    onCheckedChange={(checked) => 
                      updateApiDebug({ showResponses: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show API Errors</Label>
                  <Switch
                    checked={apiDebug.showErrors}
                    onCheckedChange={(checked) => 
                      updateApiDebug({ showErrors: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 