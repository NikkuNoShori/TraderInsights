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
  const [key, setKey] = useState(0);

  const handleSymbolChange = () => {
    setSymbol(inputSymbol);
    setKey(prev => prev + 1);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Stock Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
                className="w-full"
              />
            </div>
            <Button onClick={handleSymbolChange}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="mt-4">
            <TradingViewDashboardChart
              key={`${symbol}-${key}`}
              symbol={symbol}
              chartType="symbol"
              height={DASHBOARD_CHART_HEIGHT}
              showToolbar={false}
              showSideToolbar={false}
              allowSymbolChange={false}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 