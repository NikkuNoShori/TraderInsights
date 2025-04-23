import { useState, useEffect } from "@/lib/react";
import { TradingViewDashboardChart } from "./TradingViewDashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DASHBOARD_CHART_HEIGHT } from "@/config/chartConfig";

interface TechnicalAnalysisCardProps {
  className?: string;
  defaultSymbol?: string;
}

export function TechnicalAnalysisCard({ 
  className = "", 
  defaultSymbol = "NASDAQ:AAPL" 
}: TechnicalAnalysisCardProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [inputSymbol, setInputSymbol] = useState(defaultSymbol);
  const [interval, setInterval] = useState("D");
  const [key, setKey] = useState(0);

  const handleSymbolChange = () => {
    setSymbol(inputSymbol);
    setKey(prev => prev + 1);
  };

  const intervalOptions = [
    { value: "1", label: "1m" },
    { value: "5", label: "5m" },
    { value: "15", label: "15m" },
    { value: "30", label: "30m" },
    { value: "60", label: "1h" },
    { value: "D", label: "1D" },
    { value: "W", label: "1W" },
    { value: "M", label: "1M" },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Technical Analysis</CardTitle>
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

          <div className="flex items-center space-x-2">
            <Select value={interval} onValueChange={setInterval}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                {intervalOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4">
            <TradingViewDashboardChart
              key={`${symbol}-${interval}-${key}`}
              symbol={symbol}
              chartType="technical"
              interval={interval}
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