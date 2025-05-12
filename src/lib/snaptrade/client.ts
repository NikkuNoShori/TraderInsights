import axios from "axios";
import { Configuration, Snaptrade } from "snaptrade-typescript-sdk";
import { SnapTradeConfig, SnapTradeError, SnapTradeErrorCode, SnapTradeUserCredentials } from "./types";
import { StorageHelpers } from "./storage";

// Helper to mask sensitive data in logs
const maskId = (id: string): string => {
  if (!id) return "";
  return id.length > 8 ? `${id.substring(0, 8)}...` : id;
};

// Get environment variables safely - use consistent naming across the application
const clientId =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SNAPTRADE_CLIENT_ID || ""
    : process.env.VITE_SNAPTRADE_CLIENT_ID || "";
const consumerKey =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_SNAPTRADE_CONSUMER_KEY || ""
    : process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";

// Configure the SnapTrade SDK client (only in browser environment)
let config: Configuration | null = null;
let snaptrade: Snaptrade | null = null;
let snapTradeClient: Snaptrade | null = null;

// Only initialize in browser environment
if (typeof window !== "undefined") {
  if (!clientId || !consumerKey) {
    console.error(
      "SnapTrade clientId and consumerKey must be set in environment variables"
    );
  } else {
    config = new Configuration({
      clientId,
      consumerKey,
      // Override the base path to use our proxy server
      basePath:
        typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.DEV
          ? "/api/snaptrade/proxy" // Use our proxy in development
          : "https://api.snaptrade.com/api/v1", // Use direct access in production
    });

    // Export the Snaptrade instance for direct SDK use
    snaptrade = new Snaptrade(config);
    snapTradeClient = snaptrade;
  }
}

// Class-based wrapper for components that need more control
export class SnapTradeClient {
  private client: Snaptrade;
  private useProxy: boolean;
  private clientId: string;
  private consumerKey: string;

  constructor(config: SnapTradeConfig) {
    this.clientId = config.clientId;
    this.consumerKey = config.consumerKey;
    
    // Use proxy in development, direct access in production
    this.useProxy =
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.DEV === true;

    // Configure the SDK with potential proxy path
    const sdkConfig = new Configuration({
      clientId: config.clientId,
      consumerKey: config.consumerKey,
      basePath: this.useProxy
        ? "/api/snaptrade/proxy"
        : "https://api.snaptrade.com/api/v1",
    });

    this.client = new Snaptrade(sdkConfig);
  }

  // Get stored user credentials
  getUser(): SnapTradeUserCredentials | null {
    return StorageHelpers.getUser();
  }

  async registerUser(userId: string) {
    try {
      console.log(`Registering user with SnapTrade: ${maskId(userId)}`);

      // Check if userId is valid
      if (!userId || userId.trim() === "") {
        throw new SnapTradeError(
          "Invalid userId: Cannot be empty",
          SnapTradeErrorCode.REGISTRATION_ERROR
        );
      }

      try {
        // Always use our server API endpoint for registration to handle auth properly
        console.log("Using server API endpoint for registration");
        const response = await fetch("/api/snaptrade/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, clientId: this.clientId }),
        });

        if (!response.ok && response.status !== 200) {
          const errorData = await response.json();
          throw new SnapTradeError(
            errorData.error || "Registration failed",
            SnapTradeErrorCode.REGISTRATION_ERROR,
            errorData
          );
        }

        const data = await response.json();

        // Check if this is the "user already exists" case
        if (data.warning && data.warning.includes("already exists")) {
          console.log("User already exists in SnapTrade");
          throw new SnapTradeError(
            "This user is already registered with SnapTrade",
            SnapTradeErrorCode.REGISTRATION_ERROR,
            { userAlreadyExists: true }
          );
        }

        // Store user credentials
        const credentials = {
          userId: data.userId,
          userSecret: data.userSecret,
        };
        
        StorageHelpers.saveUser(credentials);

        // Normal successful registration
        return credentials;
      } catch (error: any) {
        // If there's a userAlreadyExists error, throw it for handling
        if (
          error instanceof SnapTradeError &&
          error.details &&
          (error.details as any).userAlreadyExists
        ) {
          throw error;
        }

        console.error("Server API registration failed:", error);
        throw new SnapTradeError(
          "Failed to register with SnapTrade. Please try again later.",
          SnapTradeErrorCode.REGISTRATION_ERROR,
          error
        );
      }
    } catch (error) {
      console.error("SnapTrade registration error:", error);

      // Special case for already registered users
      if (
        error instanceof SnapTradeError &&
        error.details &&
        (error.details as any).userAlreadyExists
      ) {
        throw error;
      }

      let errorMessage = "Failed to register with SnapTrade";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      throw new SnapTradeError(
        errorMessage,
        SnapTradeErrorCode.REGISTRATION_ERROR,
        error
      );
    }
  }

  // Get user accounts via the API
  async listUserAccounts(userId: string, userSecret: string) {
    try {
      // Use the direct endpoint instead of the SDK
      const params = new URLSearchParams({
        userId,
        userSecret,
        clientId: this.clientId,
        timestamp: Math.floor(Date.now() / 1000).toString()
      });
      
      const response = await fetch(`/api/snaptrade/accounts?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error("Error fetching accounts:", error);
      throw new SnapTradeError(
        error instanceof Error ? error.message : "Failed to fetch accounts",
        SnapTradeErrorCode.ACCOUNTS_ERROR,
        error
      );
    }
  }

  // Get brokerages list for display
  async getBrokerages() {
    try {
      const response = await fetch("/api/snaptrade/brokerages");
      if (!response.ok) {
        throw new Error(`Failed to fetch brokerages: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching brokerages:", error);
      throw new SnapTradeError(
        error instanceof Error ? error.message : "Failed to fetch brokerages",
        SnapTradeErrorCode.API_ERROR,
        error
      );
    }
  }

  // Create connection link for broker auth
  async createConnectionLink(userId: string, userSecret: string, brokerId: string, options: any = {}) {
    try {
      const response = await fetch("/api/snaptrade/broker-connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          userSecret,
          brokerId,
          redirectUri: options.redirectUri || window.location.origin + '/app/broker-callback'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get connection URL: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.redirectUri) {
        throw new Error("No redirect URL returned");
      }
      
      return {
        redirectURI: data.redirectUri,
        sessionId: data.sessionId || ''
      };
    } catch (error) {
      console.error("Error creating connection link:", error);
      throw new SnapTradeError(
        error instanceof Error ? error.message : "Failed to create connection link",
        SnapTradeErrorCode.CONNECTION_ERROR,
        error
      );
    }
  }
}

// Export the client instances
export { snaptrade, snapTradeClient };
