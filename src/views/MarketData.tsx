import { useState } from "@/lib/react";
import { TradingViewMarketChart } from "@/components/market/TradingViewMarketChart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function MarketData() {
  const [symbol, setSymbol] = useState<string>("NASDAQ:AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("NASDAQ:AAPL");
  const [interval, setInterval] = useState<string>("D");

  const handleSymbolChange = () => {
    setSymbol(inputSymbol);
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
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 border border-border mb-6">
        <h2 className="text-xl font-semibold mb-4">Market Data</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex gap-2">
              <Input
                placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSymbolChange}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            {intervalOptions.map((option) => (
              <Button
                key={option.value}
                variant={interval === option.value ? "default" : "outline"}
                onClick={() => setInterval(option.value)}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
        <TradingViewMarketChart 
          symbol={symbol} 
          interval={interval}
          height={600}
          studies={["Volume@tv-basicstudies", "MACD@tv-basicstudies"]}
        />
      </div>
    </div>
  );
} 