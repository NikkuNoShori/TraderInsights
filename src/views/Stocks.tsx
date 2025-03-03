import { useState } from "@/lib/react";
import { StockChart } from "@/components/charts/StockChart";
import { generateMockStockData } from "@/utils/mockData";
import type { ChartType } from "@/components/charts/ChartTypeSelector";

export default function Stocks() {
  const [chartType] = useState<ChartType>("area");
  const mockData = generateMockStockData("AAPL");

  return (
    <div className="p-6">
      <div className="bg-card rounded-lg p-6 border border-border">
        <StockChart data={mockData} type={chartType} />
      </div>
    </div>
  );
}
