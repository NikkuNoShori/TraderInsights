import { type TimeframeOption } from "@/components/ui/TimeframeSelector";
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  eachHourOfInterval,
  addHours,
} from "date-fns";

export interface TimeframeConfig {
  start: Date;
  end: Date;
  dateFormat: string;
  intervals: Date[];
}

export function getTimeframeConfig(
  timeframe: TimeframeOption
): TimeframeConfig {
  const now = new Date();
  let start: Date;
  let end: Date;
  let dateFormat: string;
  let intervals: Date[];

  switch (timeframe) {
    case "1D":
      start = startOfDay(subDays(now, 1));
      end = endOfDay(start);
      dateFormat = "HH:mm";
      intervals = eachHourOfInterval({ start, end });
      break;
    case "1W":
      start = startOfDay(subDays(now, 7));
      end = endOfDay(now);
      dateFormat = "EEE";
      intervals = eachDayOfInterval({ start, end });
      break;
    case "1M":
      start = startOfDay(subMonths(now, 1));
      end = endOfDay(now);
      dateFormat = "MMM d";
      intervals = eachDayOfInterval({ start, end });
      break;
    case "3M":
      start = startOfMonth(subMonths(now, 3));
      end = endOfMonth(now);
      dateFormat = "MMM yyyy";
      intervals = eachMonthOfInterval({ start, end });
      break;
    case "YTD":
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfMonth(now);
      dateFormat = "MMM yyyy";
      intervals = eachMonthOfInterval({ start, end });
      break;
    case "1Y":
      start = startOfMonth(subMonths(now, 12));
      end = endOfMonth(now);
      dateFormat = "MMM yyyy";
      intervals = eachMonthOfInterval({ start, end });
      break;
    case "ALL":
    default:
      start = startOfMonth(new Date(0));
      end = endOfMonth(now);
      dateFormat = "MMM yyyy";
      intervals = eachMonthOfInterval({ start, end });
  }

  return { start, end, dateFormat, intervals };
}

export function getIntervalEnd(
  intervalStart: Date,
  timeframe: TimeframeOption
): Date {
  switch (timeframe) {
    case "1D":
      return addHours(intervalStart, 1);
    case "1W":
    case "1M":
      return endOfDay(intervalStart);
    case "3M":
    case "YTD":
    case "1Y":
    case "ALL":
      return endOfMonth(intervalStart);
    default:
      return endOfDay(intervalStart);
  }
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number): string =>
  `${Math.abs(value).toFixed(1)}%`;

export function calculateYAxisDomain(values: number[]): [number, number] {
  const minValue = values.length > 0 ? Math.min(0, ...values) : 0;
  const maxValue = values.length > 0 ? Math.max(0, ...values) : 100;
  const valueRange = maxValue - minValue;
  const padding = Math.max(valueRange * 0.1, 100);

  return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];
}
