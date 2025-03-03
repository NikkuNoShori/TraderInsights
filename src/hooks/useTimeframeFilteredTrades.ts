import { useMemo } from "@/lib/react";
import type { Trade } from "@/types/trade";
import type { TimeframeOption } from "@/components/ui/TimeframeSelector";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfMonth,
  startOfYear,
} from "date-fns";

export function useTimeframeFilteredTrades(
  trades: Trade[],
  timeframe: TimeframeOption,
) {
  return useMemo(() => {
    if (!trades.length) return [];

    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    // Determine date range based on timeframe
    switch (timeframe) {
      case "1D":
        startDate = startOfDay(subDays(now, 1));
        break;
      case "1W":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "1M":
        startDate = startOfDay(subMonths(now, 1));
        break;
      case "3M":
        startDate = startOfDay(subMonths(now, 3));
        break;
      case "YTD":
        startDate = startOfYear(now);
        break;
      case "1Y":
        startDate = startOfDay(subMonths(now, 12));
        break;
      case "ALL":
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = startOfDay(subDays(now, 1));
    }

    // Filter trades within the timeframe
    return trades.filter((trade) => {
      const tradeDate = new Date(trade.entry_date);
      return tradeDate >= startDate && tradeDate <= endDate;
    });
  }, [trades, timeframe]);
}
