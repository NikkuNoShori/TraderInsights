import { SnapTradeConfig, SnapTradeUser } from "./types";
import { makeSnapTradeRequest } from "./auth";
import { Brokerage, BrokerageAuthorization } from "snaptrade-typescript-sdk";

interface ConnectionLinkResponse {
  redirectUri: string;
  [key: string]: any; // Allow other properties
}

export class SnapTradeService {
  private config: SnapTradeConfig;
  private user: SnapTradeUser | null = null;

  constructor(config: SnapTradeConfig) {
    this.config = config;
  }

  async initialize(config: SnapTradeConfig): Promise<void> {
    this.config = config;
  }

  getUser(): SnapTradeUser | null {
    return this.user;
  }

  async createConnectionLink(
    userId: string,
    userSecret: string
  ): Promise<{ redirectUri: string }> {
    try {
      console.log("Creating connection link:", {
        userId,
        hasUserSecret: !!userSecret,
      });

      const data = await makeSnapTradeRequest<ConnectionLinkResponse>(
        this.config,
        "/snapTrade/login",
        "POST",
        { userId, userSecret }
      );

      console.log("Connection link created successfully:", data);

      // Ensure we have a redirectUri in the response
      if (!data.redirectUri) {
        throw new Error("No redirectUri in response");
      }

      return { redirectUri: data.redirectUri };
    } catch (error) {
      console.error("Error creating connection link:", error);
      throw error;
    }
  }

  async getBrokerages(): Promise<Brokerage[]> {
    try {
      console.log("Fetching brokerages");
      const data = await makeSnapTradeRequest<Brokerage[]>(
        this.config,
        "/referenceData/brokerages",
        "GET"
      );
      return data;
    } catch (error) {
      console.error("Error fetching brokerages:", error);
      throw error;
    }
  }

  async registerUser(userId: string): Promise<string> {
    try {
      console.log("Registering user:", { userId });
      const response = await makeSnapTradeRequest<{ userSecret: string }>(
        this.config,
        "/snapTrade/registerUser",
        "POST",
        { userId }
      );

      if (!response.userSecret) {
        throw new Error("No userSecret in response");
      }

      this.user = {
        userId,
        userSecret: response.userSecret,
      };

      return response.userSecret;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  connections = {
    list: async (): Promise<BrokerageAuthorization[]> => {
      try {
        if (!this.user) {
          throw new Error("User not authenticated");
        }

        const data = await makeSnapTradeRequest<BrokerageAuthorization[]>(
          this.config,
          "/authorizations",
          "GET",
          {
            userId: this.user.userId,
            userSecret: this.user.userSecret,
          }
        );

        return data;
      } catch (error) {
        console.error("Error listing connections:", error);
        throw error;
      }
    },

    delete: async (authorizationId: string): Promise<void> => {
      try {
        if (!this.user) {
          throw new Error("User not authenticated");
        }

        await makeSnapTradeRequest(
          this.config,
          `/authorizations/${authorizationId}`,
          "DELETE",
          {
            userId: this.user.userId,
            userSecret: this.user.userSecret,
          }
        );
      } catch (error) {
        console.error("Error deleting connection:", error);
        throw error;
      }
    },
  };
}
