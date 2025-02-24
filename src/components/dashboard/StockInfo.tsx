import { RefreshCw } from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/utils/formatters";
import type { StockQuote } from "@/types/stock";

export interface StockInfoProps {
  data: StockQuote;
  onRefresh: () => void;
}

export function StockInfo({ data, onRefresh }: StockInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.symbol}
          </h2>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(data.currentPrice)}
            </span>
            <span
              className={`ml-2 text-lg font-medium ${
                data.changePercent >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {data.changePercent >= 0 ? "+" : ""}
              {formatPercent(data.changePercent / 100)}
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {formatNumber(data.volume)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Volume</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {formatNumber(data.avgVolume)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {formatCurrency(data.marketCap)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">P/E Ratio</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {data.peRatio ? formatNumber(data.peRatio) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
