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
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render when tab changes

  // Update key when tab changes to force re-render of charts
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setKey(Date.now());
  };

  // Calculate chart height - slightly smaller for the overview charts
  const chartHeight = Math.floor(DASHBOARD_CHART_HEIGHT * 0.75);

  const indices = [
    { symbol: "INDICES:SPX", name: "S&P 500" },
    { symbol: "INDICES:NDX", name: "Nasdaq 100" },
    { symbol: "INDICES:DJI", name: "Dow Jones" },
  ];

  const sectors = [
    { symbol: "AMEX:XLF", name: "Financials" },
    { symbol: "AMEX:XLK", name: "Technology" },
    { symbol: "AMEX:XLE", name: "Energy" },
    { symbol: "AMEX:XLV", name: "Healthcare" },
  ];

  const crypto = [
    { symbol: "COINBASE:BTCUSD", name: "Bitcoin" },
    { symbol: "COINBASE:ETHUSD", name: "Ethereum" },
  ];

  const forex = [
    { symbol: "FX:EURUSD", name: "EUR/USD" },
    { symbol: "FX:USDJPY", name: "USD/JPY" },
  ];

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="indices" value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="indices">Indices</TabsTrigger>
            <TabsTrigger value="sectors">Sectors</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
          </TabsList>
          
          <TabsContent value="indices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {indices.map((index) => (
                <div key={`${index.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1">{index.name}</h3>
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
          
          <TabsContent value="sectors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectors.map((sector) => (
                <div key={`${sector.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1">{sector.name}</h3>
                  <TradingViewDashboardChart 
                    key={`${sector.symbol}-${key}`}
                    symbol={sector.symbol}
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
          
          <TabsContent value="crypto" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crypto.map((coin) => (
                <div key={`${coin.symbol}-${key}`}>
                  <h3 className="text-sm font-medium mb-1">{coin.name}</h3>
                  <TradingViewDashboardChart 
                    key={`${coin.symbol}-${key}`}
                    symbol={coin.symbol}
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
                  <h3 className="text-sm font-medium mb-1">{pair.name}</h3>
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
        </Tabs>
      </CardContent>
    </Card>
  );
} 