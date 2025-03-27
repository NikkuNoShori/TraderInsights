import { useState, useEffect } from "@/lib/react";
import { TradingViewDashboardChart } from "./TradingViewDashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface StockInfoCardProps {
  className?: string;
  defaultSymbol?: string;
}

export function StockInfoCard({ 
  className = "",
  defaultSymbol = "NASDAQ:AAPL" 
}: StockInfoCardProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol);
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render when symbol changes

  const handleSymbolChange = () => {
    if (inputSymbol && inputSymbol !== symbol) {
      setSymbol(inputSymbol);
      setKey(Date.now()); // Update key to force re-render
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSymbolChange();
    }
  };

  // Calculate heights for the two charts
  const symbolInfoHeight = 120;
  const chartHeight = DASHBOARD_CHART_HEIGHT;
  const totalHeight = symbolInfoHeight + chartHeight + 16; // 16px for gap

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Stock Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSymbolChange} size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4" style={{ height: `${totalHeight}px` }}>
          <div style={{ height: `${symbolInfoHeight}px` }}>
            <TradingViewDashboardChart 
              key={`symbol-${key}`}
              symbol={symbol}
              chartType="symbol"
              height={symbolInfoHeight}
              allowSymbolChange={false}
            />
          </div>
          
          <div style={{ height: `${chartHeight}px` }}>
            <TradingViewDashboardChart 
              key={`chart-${key}`}
              symbol={symbol}
              chartType="advanced"
              height={chartHeight}
              style="1"
              showToolbar={false}
              showSideToolbar={false}
              allowSymbolChange={false}
              studies={["Volume@tv-basicstudies", "MACD@tv-basicstudies"]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
import { useState, useEffect } from "@/lib/react";
import { TradingViewDashboardChart } from "./TradingViewDashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface StockInfoCardProps {
  className?: string;
  defaultSymbol?: string;
}

export function StockInfoCard({ 
  className = "",
  defaultSymbol = "NASDAQ:AAPL" 
}: StockInfoCardProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol);
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render when symbol changes

  const handleSymbolChange = () => {
    if (inputSymbol && inputSymbol !== symbol) {
      setSymbol(inputSymbol);
      setKey(Date.now()); // Update key to force re-render
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSymbolChange();
    }
  };

  // Calculate heights for the two charts
  const symbolInfoHeight = 120;
  const chartHeight = DASHBOARD_CHART_HEIGHT;
  const totalHeight = symbolInfoHeight + chartHeight + 16; // 16px for gap

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Stock Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSymbolChange} size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-4" style={{ height: `${totalHeight}px` }}>
          <div style={{ height: `${symbolInfoHeight}px` }}>
            <TradingViewDashboardChart 
              key={`symbol-${key}`}
              symbol={symbol}
              chartType="symbol"
              height={symbolInfoHeight}
              allowSymbolChange={false}
            />
          </div>
          
          <div style={{ height: `${chartHeight}px` }}>
            <TradingViewDashboardChart 
              key={`chart-${key}`}
              symbol={symbol}
              chartType="advanced"
              height={chartHeight}
              style="1"
              showToolbar={false}
              showSideToolbar={false}
              allowSymbolChange={false}
              studies={["Volume@tv-basicstudies", "MACD@tv-basicstudies"]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 