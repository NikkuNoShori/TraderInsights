import { env } from "../../config/env";
import {
  websocketClient,
  WebSocketClient,
  WebSocketClientEvent,
  WebSocketMessage,
} from "@polygon.io/client-js";
import { create } from "zustand";

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  lastError: Error | null;
  reconnectAttempts: number;
}

interface WebSocketStore extends WebSocketState {
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: Error | null) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

const useWebSocketStore = create<WebSocketStore>((set) => ({
  isConnected: false,
  isConnecting: false,
  lastError: null,
  reconnectAttempts: 0,
  setConnected: (connected) => set({ isConnected: connected }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ lastError: error }),
  incrementReconnectAttempts: () =>
    set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 })),
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));

class WebSocketManager {
  private static instance: WebSocketManager;
  private client: WebSocketClient;
  private socket: WebSocketClient | null = null;
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, Set<(data: WebSocketMessage) => void>> =
    new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 3000; // 3 seconds

  private constructor() {
    this.client = websocketClient(env.POLYGON_API_KEY);
    this.initialize();
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  private initialize() {
    try {
      useWebSocketStore.getState().setConnecting(true);
      this.socket = this.client.stocks();

      this.socket.onopen = this.handleOpen;
      this.socket.onclose = this.handleClose;
      this.socket.onerror = this.handleError;
      this.socket.onmessage = this.handleMessage;

      useWebSocketStore.getState().setConnected(true);
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      useWebSocketStore.getState().setConnecting(false);
    }
  }

  private handleOpen = () => {
    const store = useWebSocketStore.getState();
    store.setConnected(true);
    store.resetReconnectAttempts();
    store.setError(null);

    // Resubscribe to all symbols
    if (this.socket && this.subscriptions.size > 0) {
      this.socket.subscribe(Array.from(this.subscriptions));
    }
  };

  private handleClose = () => {
    const store = useWebSocketStore.getState();
    store.setConnected(false);
    this.attemptReconnect();
  };

  private handleError = (error: Error | Event) => {
    const store = useWebSocketStore.getState();
    const errorObj =
      error instanceof Error ? error : new Error("WebSocket error occurred");
    store.setError(errorObj);
    store.setConnected(false);
    console.error("WebSocket error:", errorObj);
    this.attemptReconnect();
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as WebSocketMessage;
      const handlers = this.messageHandlers.get(data.sym);
      if (handlers) {
        handlers.forEach((handler) => handler(data));
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  private attemptReconnect = () => {
    const store = useWebSocketStore.getState();
    if (store.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      store.setError(new Error("Max reconnection attempts reached"));
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      store.incrementReconnectAttempts();
      this.initialize();
    }, this.RECONNECT_INTERVAL);
  };

  subscribe(
    symbol: string,
    callback: (data: WebSocketMessage) => void
  ): () => void {
    const formattedSymbol = `T.${symbol}`;
    this.subscriptions.add(formattedSymbol);

    if (!this.messageHandlers.has(symbol)) {
      this.messageHandlers.set(symbol, new Set());
    }
    this.messageHandlers.get(symbol)?.add(callback);

    if (this.socket && useWebSocketStore.getState().isConnected) {
      this.socket.subscribe([formattedSymbol]);
    }

    return () => {
      this.unsubscribe(symbol, callback);
    };
  }

  private unsubscribe(
    symbol: string,
    callback: (data: WebSocketMessage) => void
  ) {
    const formattedSymbol = `T.${symbol}`;
    const handlers = this.messageHandlers.get(symbol);

    if (handlers) {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.messageHandlers.delete(symbol);
        this.subscriptions.delete(formattedSymbol);
        if (this.socket) {
          this.socket.unsubscribe([formattedSymbol]);
        }
      }
    }
  }

  cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.subscriptions.clear();
    this.messageHandlers.clear();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsManager = WebSocketManager.getInstance();
export { useWebSocketStore };
