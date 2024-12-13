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

export interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  avgVolume3Month: number;
  float: number;
  weekHigh52: number;
  weekLow52: number;
  nextEarningsDate: string;
  sector: string;
  index: string;
  open: number;
  high: number;
  low: number;
  afterHoursPrice: number;
  afterHoursChange: number;
  afterHoursChangePercent: number;
  sharesOutstanding: number;
}