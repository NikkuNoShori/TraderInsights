import axios from "axios";
import { Configuration, Snaptrade } from "snaptrade-typescript-sdk";
import { SnapTradeConfig, SnapTradeError, SnapTradeErrorCode } from "./types";

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

  constructor(config: SnapTradeConfig) {
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
        const response = await fetch("/api/snaptrade/registerUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
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

        // Normal successful registration
        return {
          userId: data.userId,
          userSecret: data.userSecret,
        };
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

  async loginUser(userId: string, userSecret: string, broker?: string) {
    try {
      console.log(
        `SnapTradeClient.loginUser called for user: ${maskId(userId)}`
      );
      if (broker) {
        console.log(`Broker selected: ${broker}`);
      } else {
        console.log("No specific broker selected (showing all brokers)");
      }
      console.log(`Using proxy: ${this.useProxy ? "Yes" : "No"}`);

      // Check if credentials are valid
      if (!userId || !userSecret) {
        throw new SnapTradeError(
          "Missing credentials: userId and userSecret are required",
          SnapTradeErrorCode.AUTHENTICATION_ERROR
        );
      }

      // Always use the more reliable server endpoint for broker connections
      try {
        console.log("Using dedicated broker-connect endpoint");
        const response = await fetch("/api/snaptrade/broker-connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            userSecret,
            broker,
          }),
        });

        if (!response.ok) {
          const responseData = await response.json();
          console.log("Broker connect failed:", responseData);
          throw new Error(
            responseData.error || responseData.message || "Connection failed"
          );
        }

        const responseData = await response.json();

        console.log("Broker connect response:", {
          status: response.status,
          hasRedirectUri: !!responseData.redirectUri,
        });

        // Check for redirect URI
        const redirectUri = responseData.redirectUri;

        if (!redirectUri) {
          throw new Error("No redirect URI returned from SnapTrade API");
        }

        return { redirectUri };
      } catch (error) {
        console.error("Broker connect endpoint failed:", error);

        // Fall back to SDK implementation as last resort
        console.log("Falling back to SDK implementation");

        const params: any = {
          userId,
          userSecret,
          connectionType: "trade",
        };

        // Only add broker parameter if it's provided
        if (broker) {
          params.broker = broker;
        }

        console.log("Sending loginSnapTradeUser request via SDK");

        const startTime = Date.now();
        const response = await this.client.authentication.loginSnapTradeUser(
          params
        );
        const endTime = Date.now();
        console.log(`Login request took ${endTime - startTime}ms`);

        // Access the response data - the SDK types may have redirectUri or redirectURI
        const responseData = response.data as any;
        if (response.status) {
          console.log(`Login response status: ${response.status}`);
        }

        if (!responseData.redirectUri && !responseData.redirectURI) {
          throw new SnapTradeError(
            "No redirect URI returned",
            SnapTradeErrorCode.API_ERROR
          );
        }

        return {
          redirectUri: responseData.redirectUri || responseData.redirectURI,
        };
      }
    } catch (error) {
      console.error("SnapTrade login error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 0;
        const responseData = error.response?.data || {};

        console.error("Axios error details:", {
          status,
          statusText: error.response?.statusText,
          data: responseData,
        });

        // Provide specific error messages based on status codes
        if (status === 400) {
          console.error("Bad request error - possibly incorrect parameters");
          throw new SnapTradeError(
            "Invalid request to SnapTrade API. Please check your parameters.",
            SnapTradeErrorCode.API_ERROR,
            responseData
          );
        } else if (status === 401 || status === 403) {
          console.error("Authentication error - credentials might be invalid");
          throw new SnapTradeError(
            "Authentication failed. Your SnapTrade user credentials might be invalid or expired.",
            SnapTradeErrorCode.AUTHENTICATION_ERROR,
            responseData
          );
        } else if (status === 404) {
          console.error("User not found - may need to register first");
          throw new SnapTradeError(
            "User not found in SnapTrade. Please register this user first.",
            SnapTradeErrorCode.AUTHENTICATION_ERROR,
            responseData
          );
        } else if (status >= 500) {
          console.error("Server error from SnapTrade API");
          throw new SnapTradeError(
            "SnapTrade server error. Please try again later.",
            SnapTradeErrorCode.API_ERROR,
            responseData
          );
        }
      }

      // Provide more detailed error info for debugging
      let errorMessage = "Failed to login with SnapTrade";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      throw new SnapTradeError(
        errorMessage,
        SnapTradeErrorCode.API_ERROR,
        error
      );
    }
  }

  async getBrokerages() {
    try {
      console.log("Fetching available brokerages from SnapTrade");

      // Use direct API call through our proxy - most reliable approach
      const apiUrl = "/api/snaptrade/proxy/brokerages";

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch brokerages: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching brokerages:", error);

      throw new SnapTradeError(
        "Failed to fetch available brokerages",
        SnapTradeErrorCode.API_ERROR,
        error
      );
    }
  }

  async getUserAccounts(userId: string, userSecret: string) {
    try {
      console.log(`Fetching accounts for user: ${maskId(userId)}`);

      if (!userId || !userSecret) {
        throw new SnapTradeError(
          "Missing credentials: userId and userSecret are required",
          SnapTradeErrorCode.AUTHENTICATION_ERROR
        );
      }

      const response = await this.client.accountInformation.listUserAccounts({
        userId,
        userSecret,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching user accounts:", error);

      throw new SnapTradeError(
        "Failed to fetch user accounts",
        SnapTradeErrorCode.ACCOUNTS_ERROR,
        error
      );
    }
  }

  async getAccountHoldings(
    userId: string,
    userSecret: string,
    accountId: string
  ) {
    try {
      console.log(`Fetching holdings for account: ${maskId(accountId)}`);

      if (!userId || !userSecret || !accountId) {
        throw new SnapTradeError(
          "Missing parameters: userId, userSecret, and accountId are required",
          SnapTradeErrorCode.AUTHENTICATION_ERROR
        );
      }

      // Use getUserAccountPositions since getAccountHoldings may not exist in all versions
      const response =
        await this.client.accountInformation.getUserAccountPositions({
          userId,
          userSecret,
          accountId,
        });

      return response.data;
    } catch (error) {
      console.error("Error fetching account holdings:", error);

      throw new SnapTradeError(
        "Failed to fetch account holdings",
        SnapTradeErrorCode.POSITIONS_ERROR,
        error
      );
    }
  }
}

// Export the client classes/instances
export { snaptrade, snapTradeClient };
