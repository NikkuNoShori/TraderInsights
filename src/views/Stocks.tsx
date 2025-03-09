import { useState } from "@/lib/react";
import { TradingViewStockChart } from "@/components/TradingViewStockChart";
import { generateMockStockData } from "@/utils/mockData";
import type { ChartType } from "@/components/ChartTypeSelector";
import { ChartTypeSelector } from "@/components/ChartTypeSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Stocks() {
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [symbol, setSymbol] = useState<string>("NASDAQ:AAPL");
  const [inputSymbol, setInputSymbol] = useState<string>("NASDAQ:AAPL");
  const mockData = generateMockStockData("AAPL");

  const handleSymbolChange = () => {
    setSymbol(inputSymbol);
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 border border-border mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">Stock Chart</h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder="Enter symbol (e.g., NASDAQ:AAPL)"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                className="flex-1 md:w-64"
              />
              <Button onClick={handleSymbolChange}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <ChartTypeSelector selectedType={chartType} onChange={setChartType} />
          </div>
        </div>
        <TradingViewStockChart 
          data={mockData} 
          type={chartType} 
          symbol={symbol}
          height={500}
          studies={["Volume@tv-basicstudies", "MACD@tv-basicstudies"]}
        />
      </div>
    </div>
  );
}
