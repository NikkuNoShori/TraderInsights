declare module "@polygon.io/client-js" {
  import { w3cwebsocket } from "websocket";

  export interface TradeMessage {
    ev: string;
    sym: string;
    p: number; // price
    s: number; // size
    t: number; // timestamp
    c: number[]; // conditions
  }

  export interface PolygonWebSocket extends w3cwebsocket {
    subscribe(symbols: string[]): void;
    unsubscribe(symbols: string[]): void;
    onopen: (() => void) | null;
    onclose: (() => void) | null;
    onerror: ((error: Error | Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    close(): void;
  }

  export interface IWebsocketClient {
    stocks: () => PolygonWebSocket;
    forex: () => PolygonWebSocket;
    crypto: () => PolygonWebSocket;
  }

  export function websocketClient(
    apiKey: string,
    options?: Record<string, unknown>
  ): IWebsocketClient;

  // ... rest of the existing types for REST client ...
}
