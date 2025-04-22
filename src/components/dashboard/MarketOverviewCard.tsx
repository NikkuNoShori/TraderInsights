import { useState, useEffect } from "@/lib/react";
import { TradingViewDashboardChart } from "./TradingViewDashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface MarketOverviewCardProps {
  className?: string;
}

export function MarketOverviewCard({ className = "" }: MarketOverviewCardProps) {
  const [activeTab, setActiveTab] = useState("indices");
  const [key, setKey] = useState(0); // For forcing chart re-renders

  const chartHeight = DASHBOARD_CHART_HEIGHT;

  // Sample data - replace with real data
  const indices = [
    { symbol: "SP:SPX", name: "S&P 500" },
    { symbol: "NASDAQ:NDX", name: "NASDAQ 100" },
    { symbol: "DJI:DJI", name: "Dow Jones" },
    { symbol: "CBOE:VIX", name: "VIX" }
  ];

  const forex = [
    { symbol: "FX:EURUSD", name: "EUR/USD" },
    { symbol: "FX:GBPUSD", name: "GBP/USD" },
    { symbol: "FX:USDJPY", name: "USD/JPY" },
    { symbol: "FX:AUDUSD", name: "AUD/USD" }
  ];

  const commodities = [
    { symbol: "CME:GC1!", name: "Gold" },
    { symbol: "CME:SI1!", name: "Silver" },
    { symbol: "NYMEX:CL1!", name: "Crude Oil" },
    { symbol: "NYMEX:NG1!", name: "Natural Gas" }
  ];

  // Force chart re-render when tab changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [activeTab]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="indices">Indices</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="commodities">Commodities</TabsTrigger>
          </TabsList>

          <TabsContent value="indices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indices.map((index) => (
                <div key={`${index.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1 text-default">{index.name}</h3>
                  <TradingViewDashboardChart 
                    key={`${index.symbol}-${key}`}
                    symbol={index.symbol}
                    chartType="advanced"
                    height={chartHeight}
                    style="1"
                    showToolbar={false}
                    showSideToolbar={false}
                    allowSymbolChange={false}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forex" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {forex.map((pair) => (
                <div key={`${pair.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1 text-default">{pair.name}</h3>
                  <TradingViewDashboardChart 
                    key={`${pair.symbol}-${key}`}
                    symbol={pair.symbol}
                    chartType="advanced"
                    height={chartHeight}
                    style="1"
                    showToolbar={false}
                    showSideToolbar={false}
                    allowSymbolChange={false}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commodities" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commodities.map((commodity) => (
                <div key={`${commodity.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1 text-default">{commodity.name}</h3>
                  <TradingViewDashboardChart 
                    key={`${commodity.symbol}-${key}`}
                    symbol={commodity.symbol}
                    chartType="advanced"
                    height={chartHeight}
                    style="1"
                    showToolbar={false}
                    showSideToolbar={false}
                    allowSymbolChange={false}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 