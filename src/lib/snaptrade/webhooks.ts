import { SnapTradeError, SnapTradeErrorCode } from "./types";
import { SnapTradeClient } from "./client";
import { StorageHelpers } from "./storage";
import crypto from "crypto";

/**
 * Webhook event types from SnapTrade
 */
export enum WebhookEventType {
  CONNECTION_STATUS = "connection.status",
  ACCOUNT_SYNC = "account.sync",
  ERROR = "error",
  TRADE = "trade",
}

/**
 * Webhook payload types
 */
export interface WebhookPayload {
  event: WebhookEventType;
  data: {
    userId: string;
    userSecret: string;
    timestamp: number;
    [key: string]: any;
  };
}

/**
 * Webhook handler function type
 */
export type WebhookHandler = (payload: WebhookPayload) => Promise<void>;

/**
 * Webhook manager for handling SnapTrade webhooks
 */
export class WebhookManager {
  private client: SnapTradeClient;
  private handlers: Map<string, Array<(payload: any) => Promise<void>>>;
  private webhookSecret: string;

  constructor(client: SnapTradeClient, webhookSecret: string) {
    this.client = client;
    this.handlers = new Map();
    this.webhookSecret = webhookSecret;
  }

  /**
   * Register a handler for a specific webhook event type
   */
  public registerHandler(
    eventType: string,
    handler: (payload: any) => Promise<void>
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  /**
   * Process an incoming webhook request
   */
  public async processWebhook(
    signature: string,
    payload: any,
    timestamp: string
  ): Promise<void> {
    // Verify webhook signature
    this.verifySignature(signature, payload, timestamp);

    // Verify timestamp is not too old (5 minutes)
    const eventTimestamp = new Date(timestamp).getTime();
    const now = Date.now();
    if (now - eventTimestamp > 5 * 60 * 1000) {
      throw new SnapTradeError(
        "Webhook timestamp too old",
        SnapTradeErrorCode.API_ERROR
      );
    }

    // Get handlers for this event type
    const handlers = this.handlers.get(payload.event) || [];

    // Execute all handlers
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(
            `Error in webhook handler for ${payload.event}:`,
            error
          );
          // Don't throw here to allow other handlers to execute
        }
      })
    );
  }

  /**
   * Verify webhook signature
   */
  private verifySignature(
    signature: string,
    payload: any,
    timestamp: string
  ): void {
    const message = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(message)
      .digest("hex");

    if (signature !== expectedSignature) {
      throw new SnapTradeError(
        "Invalid webhook signature",
        SnapTradeErrorCode.API_ERROR
      );
    }
  }
}

/**
 * Default webhook handlers
 */
export const defaultWebhookHandlers = {
  /**
   * Handle connection status updates
   */
  handleConnectionStatus: async (payload: any) => {
    const { userId, userSecret, status } = payload.data;

    // Update connection status in storage
    const connections = StorageHelpers.getConnections();
    const updatedConnections = connections.map((conn) => {
      if (conn.userId === userId && conn.userSecret === userSecret) {
        return { ...conn, status };
      }
      return conn;
    });

    StorageHelpers.saveConnections(updatedConnections);
  },

  /**
   * Handle account sync events
   */
  handleAccountSync: async (payload: any) => {
    const { userId, userSecret } = payload.data;
    const clientId = process.env.SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      throw new SnapTradeError(
        "SnapTrade client configuration missing",
        SnapTradeErrorCode.API_ERROR
      );
    }

    const client = new SnapTradeClient({
      clientId,
      consumerKey,
    });

    const accounts = await client.getAccounts(userId, userSecret);
    StorageHelpers.saveAccounts(accounts);
  },

  /**
   * Handle error events
   */
  handleError: async (payload: any) => {
    const { userId, userSecret, error } = payload.data;
    console.error(`SnapTrade error for user ${userId}:`, error);

    // Update error status in storage
    const connections = StorageHelpers.getConnections();
    const updatedConnections = connections.map((conn) => {
      if (conn.userId === userId && conn.userSecret === userSecret) {
        return { ...conn, error };
      }
      return conn;
    });

    StorageHelpers.saveConnections(updatedConnections);
  },
};

/**
 * Create and configure a webhook manager
 */
export function createWebhookManager(
  client: SnapTradeClient
): WebhookManager | null {
  const webhookSecret = process.env.SNAPTRADE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn(
      "Webhook secret not configured. Webhook functionality will be disabled."
    );
    return null;
  }

  const manager = new WebhookManager(client, webhookSecret);

  // Register default handlers
  manager.registerHandler(
    "connection.status",
    defaultWebhookHandlers.handleConnectionStatus
  );
  manager.registerHandler(
    "account.sync",
    defaultWebhookHandlers.handleAccountSync
  );
  manager.registerHandler("error", defaultWebhookHandlers.handleError);

  return manager;
}
