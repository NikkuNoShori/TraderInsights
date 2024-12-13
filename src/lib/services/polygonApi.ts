import axios from 'axios';
import { restClient, websocketClient } from '@polygon.io/client-js';
import { withRetry } from '../../utils/withRetry';
import { create } from 'zustand';

const POLYGON_API_KEY = 'FFEAlcuNOfPCBDK4hEsED_VrWvJlYxNO';
const rest = restClient(POLYGON_API_KEY);
const ws = websocketClient(POLYGON_API_KEY);

interface ApiState {
  requestCount: number;
  lastRequestTime: number;
  remainingCalls: number;
}

export const useApiStore = create<ApiState>((set) => ({
  requestCount: 0,
  lastRequestTime: Date.now(),
  remainingCalls: 5
}));

const checkRateLimit = () => {
  const { requestCount, lastRequestTime } = useApiStore.getState();
  const now = Date.now();
  
  if (now - lastRequestTime >= 60000) {
    useApiStore.setState({
      requestCount: 1,
      lastRequestTime: now,
      remainingCalls: 4
    });
    return;
  }

  if (requestCount >= 5) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }

  useApiStore.setState(state => ({
    requestCount: state.requestCount + 1,
    remainingCalls: Math.max(0, 5 - (state.requestCount + 1))
  }));
};

export const polygonApi = {
  subscribeToTicker: (symbol: string, callback: (data: any) => void) => {
    ws.stocks.subscribe(symbol);
    ws.on('T', (trade) => callback(trade));
    return () => ws.stocks.unsubscribe(symbol);
  },

  getStockQuote: async (symbol: string) => {
    checkRateLimit();
    return withRetry(async () => {
      const response = await rest.stocks.previousClose(symbol);
      return response;
    });
  },

  getDailyBars: async (symbol: string, from: string, to: string) => {
    checkRateLimit();
    return withRetry(async () => {
      const response = await rest.stocks.aggregates(symbol, 1, 'day', from, to);
      return response;
    });
  },

  getCompanyDetails: async (symbol: string) => {
    checkRateLimit();
    return withRetry(async () => {
      const response = await rest.reference.tickerDetails(symbol);
      return response;
    });
  },

  getMarketStatus: async () => {
    checkRateLimit();
    return withRetry(async () => {
      const response = await rest.reference.marketStatus();
      return response;
    });
  },

  getSnapshots: async (symbols: string[]) => {
    checkRateLimit();
    return withRetry(async () => {
      const response = await rest.stocks.snapshots(symbols);
      return response;
    });
  }
};