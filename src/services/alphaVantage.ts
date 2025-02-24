import axios from "axios";
import { parseISO, format } from "date-fns";
import type { OHLC, StockQuote } from "../types/stock";

const API_KEY =
  import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || "2WZT5WFVQM1I5R14";
const BASE_URL = "https://www.alphavantage.co/query";

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Check for API-specific error messages in the response
    if (response.data?.["Error Message"]) {
      throw new Error(response.data["Error Message"]);
    }
    if (response.data?.["Note"]?.includes("API call frequency")) {
      throw new Error("API rate limit exceeded. Please try again in a minute.");
    }
    if (Object.keys(response.data).length === 0) {
      throw new Error("Invalid API response - no data received");
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error(
          "API rate limit exceeded. Please try again in a minute.",
        );
      }
      if (!error.response) {
        throw new Error("Network error. Please check your connection.");
      }
      throw new Error(
        error.response.data?.message || "Failed to fetch data from API.",
      );
    }
    throw error;
  },
);

const validateSymbol = (symbol: string): string => {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!/^[A-Z]{1,5}$/.test(cleanSymbol)) {
    throw new Error("Invalid stock symbol format");
  }
  return cleanSymbol;
};

export async function fetchStockData(symbol: string): Promise<OHLC[]> {
  const validSymbol = validateSymbol(symbol);

  const response = await api.get("", {
    params: {
      function: "TIME_SERIES_DAILY",
      symbol: validSymbol,
      apikey: API_KEY,
      outputsize: "compact",
    },
  });

  const timeSeries = response.data["Time Series (Daily)"];
  if (!timeSeries) {
    throw new Error(`No data available for ${validSymbol}`);
  }

  return Object.entries(timeSeries)
    .slice(0, 90)
    .map(([date, values]: [string, any]) => ({
      date: format(parseISO(date), "MMM d"),
      open: Number(values["1. open"]),
      high: Number(values["2. high"]),
      low: Number(values["3. low"]),
      close: Number(values["4. close"]),
      volume: Number(values["5. volume"]),
    }))
    .reverse();
}

export async function fetchStockQuote(symbol: string): Promise<StockQuote> {
  const validSymbol = validateSymbol(symbol);

  try {
    const [quoteResponse, overviewResponse] = await Promise.all([
      api.get("", {
        params: {
          function: "GLOBAL_QUOTE",
          symbol: validSymbol,
          apikey: API_KEY,
        },
      }),
      api.get("", {
        params: {
          function: "OVERVIEW",
          symbol: validSymbol,
          apikey: API_KEY,
        },
      }),
    ]);

    const quote = quoteResponse.data["Global Quote"];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No quote data available for ${validSymbol}`);
    }

    return {
      symbol: validSymbol,
      currentPrice: Number(quote["05. price"]) || 0,
      change: Number(quote["09. change"]) || 0,
      changePercent: Number(quote["10. change percent"].replace("%", "")) || 0,
      volume: Number(quote["06. volume"]) || 0,
      avgVolume: Number(quote["06. volume"]) || 0,
      avgVolume3Month: Number(quote["06. volume"]) || 0,
      marketCap: Number(overviewResponse.data.MarketCapitalization) || 0,
      weekHigh52: Number(overviewResponse.data["52WeekHigh"]) || 0,
      weekLow52: Number(overviewResponse.data["52WeekLow"]) || 0,
      peRatio: Number(overviewResponse.data.PERatio) || undefined,
      dividend: Number(overviewResponse.data.DividendPerShare) || undefined,
      dividendYield: Number(overviewResponse.data.DividendYield) || undefined,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Failed to fetch quote for ${validSymbol}: ${error.message}`,
      );
    }
    throw error;
  }
}
