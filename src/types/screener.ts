export type TimeInterval = "intraday" | "daily" | "3day" | "5day";

export type FilterOperator =
  | "equals"
  | "greaterThan"
  | "lessThan"
  | "between"
  | "contains";

export interface ScreenerFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | [string, string];
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: ScreenerFilter[];
}

export interface ScreenerResult {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  trades: number;
  float: number;
  exchange: string;
}
