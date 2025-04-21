import { useState } from 'react';
import { useDebugStore, DebugCategory, DebugLevel } from '@/stores/debugStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { logger } from '@/lib/services/loggingService';

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

  const handleToggleDebugMode = () => {
    toggleDebugMode();
    logger.info('state', `Debug mode ${isDebugMode ? 'disabled' : 'enabled'}`);
  };

  const handleToggleCategory = (category: DebugCategory) => {
    toggleCategory(category);
    logger.info('state', `Debug category ${category} ${enabledCategories.includes(category) ? 'disabled' : 'enabled'}`);
  };

  const handleSetLogLevel = (level: DebugLevel) => {
    setLogLevel(level);
    logger.debug("state", "🐛 Debug level test message");
    logger.info("state", "ℹ️ Info level test message");
    logger.warn("state", "⚠️ Warning level test message");
    logger.error("state", new Error("❌ Error level test message"));
  };

  const handleToggleDebugPanel = () => {
    toggleDebugPanel();
    logger.info('state', `Debug panel ${showDebugPanel ? 'hidden' : 'shown'}`);
  };

  const handleUpdateBrokerDebug = (settings: Partial<typeof brokerDebug>) => {
    updateBrokerDebug(settings);
    logger.info('state', 'Broker debug settings updated', settings);
  };

  const handleUpdateApiDebug = (settings: Partial<typeof apiDebug>) => {
    updateApiDebug(settings);
    logger.info('state', 'API debug settings updated', settings);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Debug Settings</h2>
      <div className="space-y-4">
        {/* Debug Mode Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="debug-mode" className="text-sm">Debug Mode</Label>
          <Switch
            id="debug-mode"
            checked={isDebugMode}
            onCheckedChange={handleToggleDebugMode}
            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
          />
        </div>

        {isDebugMode && (
          <>
            <Separator className="my-4" />
            
            {/* Log Level */}
            <div className="space-y-2">
              <Label className="text-sm">Log Level</Label>
              <Select value={minLogLevel} onValueChange={handleSetLogLevel}>
                <SelectTrigger className="w-[200px] ml-auto">
                  <SelectValue />
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

            <Separator className="my-4" />

            {/* Debug Categories */}
            <div className="space-y-2">
              <Label className="text-sm">Debug Categories</Label>
              <div className="space-y-2">
                {DEBUG_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <Label className="text-sm">{category.charAt(0).toUpperCase() + category.slice(1)}</Label>
                    <Switch
                      checked={enabledCategories.includes(category)}
                      onCheckedChange={() => handleToggleCategory(category)}
                      className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="py-4">
              <Separator />
            </div>

            {/* Debug Panel Settings */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="debug-panel" className="text-sm">Show Debug Panel</Label>
                <Switch
                  id="debug-panel"
                  checked={showDebugPanel}
                  onCheckedChange={handleToggleDebugPanel}
                  className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                />
              </div>
            </div>

            {showDebugPanel && (
              <>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-muted-foreground hover:text-primary text-sm"
                  >
                    {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                  </Button>
                </div>

                {showAdvanced && (
                  <>
                    <Separator className="my-4" />
                    
                    {/* Broker Debug */}
                    <div className="space-y-2">
                      <Label className="text-sm">Broker Debug</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Missing Brokers</Label>
                          <Switch
                            checked={brokerDebug.showMissingBrokers}
                            onCheckedChange={(checked) =>
                              handleUpdateBrokerDebug({ showMissingBrokers: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Broker Details</Label>
                          <Switch
                            checked={brokerDebug.showBrokerDetails}
                            onCheckedChange={(checked) =>
                              handleUpdateBrokerDebug({ showBrokerDetails: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Connection Status</Label>
                          <Switch
                            checked={brokerDebug.showConnectionStatus}
                            onCheckedChange={(checked) =>
                              handleUpdateBrokerDebug({ showConnectionStatus: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* API Debug */}
                    <div className="space-y-2">
                      <Label className="text-sm">API Debug</Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Requests</Label>
                          <Switch
                            checked={apiDebug.showRequests}
                            onCheckedChange={(checked) =>
                              handleUpdateApiDebug({ showRequests: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Responses</Label>
                          <Switch
                            checked={apiDebug.showResponses}
                            onCheckedChange={(checked) =>
                              handleUpdateApiDebug({ showResponses: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Show Errors</Label>
                          <Switch
                            checked={apiDebug.showErrors}
                            onCheckedChange={(checked) =>
                              handleUpdateApiDebug({ showErrors: checked })
                            }
                            className="data-[state=unchecked]:bg-muted/50 dark:data-[state=unchecked]:bg-muted/25"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 