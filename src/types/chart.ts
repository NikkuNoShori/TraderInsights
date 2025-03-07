import { SeriesOptionsMap, SeriesPartialOptionsMap } from "lightweight-charts";

export interface CandlestickSeriesPartialOptions
  extends SeriesPartialOptionsMap {
  upColor?: string;
  downColor?: string;
  wickUpColor?: string;
  wickDownColor?: string;
  borderVisible?: boolean;
}

export interface LineSeriesPartialOptions extends SeriesPartialOptionsMap {
  color?: string;
  lineWidth?: number;
  lastPriceAnimation?: number;
}

// Extend the SeriesOptionsMap to include our custom types
declare module "lightweight-charts" {
  interface SeriesPartialOptionsMap {
    Candlestick: CandlestickSeriesPartialOptions;
    Line: LineSeriesPartialOptions;
  }
}
