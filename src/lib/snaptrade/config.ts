/**
 * SnapTrade configuration
 * This file provides configuration for the SnapTrade service
 * 
 * Note: There is a naming discrepancy between SnapTrade's documentation and dashboard:
 * - Documentation uses: clientId and consumerKey
 * - Dashboard shows: "Client ID" and "Client Secret"
 * 
 * The mapping is:
 * - "Client ID" from dashboard → VITE_SNAPTRADE_CLIENT_ID
 * - "Client Secret" from dashboard → VITE_SNAPTRADE_CONSUMER_KEY
 */

import { Configuration, Snaptrade } from "snaptrade-typescript-sdk";
import { SnapTradeConfig, SnapTradeError, SnapTradeErrorCode } from "./types";
import { errorHelpers } from "./errors";

export interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
  baseUrl?: string;
  environment?: "production" | "sandbox";
}

export class SnapTradeClientConfig {
  private config: SnapTradeConfig;
  private sdkConfig: Configuration;
  private client: Snaptrade;

  constructor(config: SnapTradeConfig) {
    this.validateConfig(config);
    this.config = config;

    this.sdkConfig = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      baseURL: config.baseUrl,
    });

    this.client = new Snaptrade(this.sdkConfig);
  }

  private validateConfig(config: SnapTradeConfig): void {
    if (!config.clientId || !config.consumerKey) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message:
          "Missing required SnapTrade configuration parameters: clientId and consumerKey are required",
      });
    }
  }

  public getConfig(): SnapTradeConfig {
    return this.config;
  }

  public getSDKConfig(): Configuration {
    return this.sdkConfig;
  }

  public getClient(): Snaptrade {
    return this.client;
  }
}

class ConfigManager {
  private config: SnapTradeConfig | null = null;

  private validateConfig(config: SnapTradeConfig): void {
    if (!config.clientId || !config.consumerKey) {
      throw new SnapTradeError({
        code: SnapTradeErrorCode.API_ERROR,
        message:
          "Missing required SnapTrade configuration parameters: clientId and consumerKey are required",
      });
    }
  }

  initialize(config: SnapTradeConfig): void {
    try {
      this.validateConfig(config);
      this.config = {
        ...config,
        baseUrl: config.baseUrl || "https://api.snaptrade.com/api/v1",
        environment: config.environment || "production",
      };
    } catch (error) {
      errorHelpers.handleConfigError(error, "Failed to initialize config");
    }
  }

  getConfig(): SnapTradeConfig {
    if (!this.config) {
      throw new SnapTradeError(
        "Configuration not initialized",
        SnapTradeErrorCode.API_ERROR
      );
    }
    return this.config;
  }

  isInitialized(): boolean {
    return this.config !== null;
  }

  getBaseUrl(): string {
    return this.getConfig().baseUrl || "https://api.snaptrade.com/api/v1";
  }

  getEnvironment(): "production" | "sandbox" {
    return this.getConfig().environment || "production";
  }

  isProduction(): boolean {
    return this.getEnvironment() === "production";
  }

  isSandbox(): boolean {
    return this.getEnvironment() === "sandbox";
  }
}

export const configManager = new ConfigManager();

// Helper functions for common configuration tasks
export const configHelpers = {
  initializeFromEnv: (): void => {
    const config: SnapTradeConfig = {
      clientId: process.env.VITE_SNAPTRADE_CLIENT_ID || "",
      consumerKey: process.env.VITE_SNAPTRADE_CONSUMER_KEY || "",
      environment:
        (process.env.VITE_SNAPTRADE_ENVIRONMENT as "production" | "sandbox") ||
        "production",
    };

    configManager.initialize(config);
  },

  getClientId: (): string => {
    return configManager.getConfig().clientId;
  },

  getConsumerKey: (): string => {
    return configManager.getConfig().consumerKey;
  },

  getBaseUrl: (): string => {
    return configManager.getBaseUrl();
  },

  getEnvironment: (): "production" | "sandbox" => {
    return configManager.getEnvironment();
  },
}; 