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
  const [interval, setInterval] = useState("1D");
  const [key, setKey] = useState(Date.now()); // Add a key to force re-render when symbol or interval changes

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

  const handleIntervalChange = (value: string) => {
    setInterval(value);
    setKey(Date.now()); // Update key to force re-render
  };

  const intervalOptions = [
    { value: "1", label: "1m" },
    { value: "5", label: "5m" },
    { value: "15", label: "15m" },
    { value: "30", label: "30m" },
    { value: "60", label: "1h" },
    { value: "120", label: "2h" },
    { value: "240", label: "4h" },
    { value: "D", label: "1D" },
    { value: "W", label: "1W" },
    { value: "M", label: "1M" },
  ];

  const getIntervalValue = (label: string) => {
    const option = intervalOptions.find(opt => opt.label === label);
    return option ? option.value : "D";
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Technical Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="flex gap-2 flex-1">
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
          
          <Select 
            value={interval} 
            onValueChange={handleIntervalChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Interval" />
            </SelectTrigger>
            <SelectContent>
              {intervalOptions.map((option) => (
                <SelectItem key={option.value} value={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div style={{ height: `${DASHBOARD_CHART_HEIGHT}px` }}>
          <TradingViewDashboardChart 
            key={`technical-${key}`}
            symbol={symbol}
            chartType="technical"
            interval={getIntervalValue(interval)}
            height={DASHBOARD_CHART_HEIGHT}
            allowSymbolChange={false}
          />
        </div>
      </CardContent>
    </Card>
  );
} 