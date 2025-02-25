import { env } from "@/config/env";
import type { StockQuote } from "@/types/stock";

const POLYGON_API_KEY = env.POLYGON_API_KEY;
const BASE_URL = "https://api.polygon.io";

export class PolygonApi {
  async getQuote(symbol: string): Promise<StockQuote> {
    const response = await fetch(
      `${BASE_URL}/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch quote for ${symbol}`);
    }

    const data = await response.json();
    return {
      symbol: data.symbol,
      currentPrice: data.last,
      change: data.todaysChange,
      changePercent: data.todaysChangePerc,
      volume: data.volume,
      avgVolume: data.prevDay?.volume || 0,
      avgVolume3Month: data.volume, // Using current volume as fallback
      marketCap: data.marketCap || 0,
      weekHigh52: data.week52High || 0,
      weekLow52: data.week52Low || 0,
      lastUpdated: new Date(data.updated).toISOString(),
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const quotes = await Promise.all(
      symbols.map((symbol) => this.getQuote(symbol))
    );
    return quotes;
  }
}
