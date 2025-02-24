import { websocketClient, type WebSocketClient } from "@polygon.io/client-js";
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

export const useWebSocketStore = create<WebSocketStore>((set) => ({
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
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 3000; // 3 seconds

  private constructor() {
    this.client = websocketClient(process.env.VITE_POLYGON_API_KEY || "");
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

      this.client.connect();

      this.client.on("open", this.handleOpen);
      this.client.on("close", this.handleClose);
      this.client.on("error", this.handleError);
      this.client.on("message", this.handleMessage);

      useWebSocketStore.getState().setConnected(true);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleOpen = () => {
    useWebSocketStore.getState().setConnected(true);
    useWebSocketStore.getState().setConnecting(false);
    useWebSocketStore.getState().resetReconnectAttempts();

    // Resubscribe to all previous subscriptions
    if (this.subscriptions.size > 0) {
      this.client.subscribe(Array.from(this.subscriptions));
    }
  };

  private handleClose = () => {
    useWebSocketStore.getState().setConnected(false);
    this.attemptReconnect();
  };

  private handleError = (error: Error | Event) => {
    const err = error instanceof Error ? error : new Error("WebSocket error");
    useWebSocketStore.getState().setError(err);
    useWebSocketStore.getState().setConnected(false);
    this.attemptReconnect();
  };

  private handleMessage = (data: any) => {
    if (data.ev && this.messageHandlers.has(data.sym)) {
      const handlers = this.messageHandlers.get(data.sym);
      handlers?.forEach((handler) => handler(data));
    }
  };

  private attemptReconnect = () => {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const { reconnectAttempts } = useWebSocketStore.getState();
    if (reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      useWebSocketStore.getState().incrementReconnectAttempts();
      this.reconnectTimeout = setTimeout(() => {
        this.initialize();
      }, this.RECONNECT_INTERVAL);
    }
  };

  subscribe(symbol: string, callback: (data: any) => void): () => void {
    if (!this.messageHandlers.has(symbol)) {
      this.messageHandlers.set(symbol, new Set());
      this.subscriptions.add(symbol);

      if (useWebSocketStore.getState().isConnected) {
        this.client.subscribe([symbol]);
      }
    }

    const handlers = this.messageHandlers.get(symbol)!;
    handlers.add(callback);

    return () => this.unsubscribe(symbol, callback);
  }

  private unsubscribe(symbol: string, callback: (data: any) => void) {
    const handlers = this.messageHandlers.get(symbol);
    if (handlers) {
      handlers.delete(callback);

      if (handlers.size === 0) {
        this.messageHandlers.delete(symbol);
        this.subscriptions.delete(symbol);
        this.client.unsubscribe([symbol]);
      }
    }
  }

  cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.client.close();
    this.messageHandlers.clear();
    this.subscriptions.clear();
    useWebSocketStore.getState().setConnected(false);
    useWebSocketStore.getState().resetReconnectAttempts();
  }
}

export const wsManager = WebSocketManager.getInstance();
