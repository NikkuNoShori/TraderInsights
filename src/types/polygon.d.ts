declare module "@polygon.io/client-js" {
  export interface PolygonClient {
    stocks: {
      previousClose(params: { ticker: string }): Promise<any>;
      aggregates(
        ticker: string,
        multiplier: number,
        timespan: string,
        from: string,
        to: string
      ): Promise<any>;
    };
    reference: {
      tickerDetails(symbol: string): Promise<any>;
      marketStatus(): Promise<any>;
    };
  }

  export interface WebSocketClient {
    connect(): void;
    subscribe(channels: string[]): void;
    unsubscribe(channels: string[]): void;
    on(event: string, callback: (data: any) => void): void;
    close(): void;
  }

  export function restClient(apiKey: string): PolygonClient;
  export function websocketClient(apiKey: string): WebSocketClient;
}

export interface TradeMessage {
  ev: string; // Event type
  sym: string; // Symbol
  p: number; // Price
  s: number; // Size
  t: number; // Timestamp
  c: number[]; // Conditions
  x: number; // Exchange
  i: string; // Trade ID
}
