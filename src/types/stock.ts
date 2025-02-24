export interface QuoteDataPoint {
  id: string;
  key: keyof StockQuote;
  label: string;
  category: "price" | "trading" | "company" | "technical";
  visible: boolean;
  format: "currency" | "number" | "percent" | "date" | "text";
}

export interface OHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockData extends OHLC {
  symbol: string;
  timestamp: string;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  avgVolume3Month: number;
  marketCap: number;
  weekHigh52: number;
  weekLow52: number;
  peRatio?: number;
  dividend?: number;
  dividendYield?: number;
  lastUpdated: string;
}

export interface WatchlistAlert {
  id: string;
  symbolId: string;
  type: "price" | "volume" | "percent_change";
  condition: "above" | "below";
  value: number;
  triggered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistSymbol {
  id: string;
  symbol: string;
  userId: string;
  name: string;
  price: number;
  change: number;
  createdAt: string;
  updatedAt: string;
  alerts?: WatchlistAlert[];
}
