export interface QuoteDataPoint {
  id: string;
  key: keyof StockQuote;
  label: string;
  category: 'price' | 'trading' | 'company' | 'technical';
  visible: boolean;
  format: 'currency' | 'number' | 'percent' | 'date' | 'text';
}

export interface OHLC {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
}

export interface StockData {
  timestamp: string;
  price: number;
  volume: number;
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface WatchlistSymbol {
  symbol: string;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  notes?: string;
  addedAt: string;
}