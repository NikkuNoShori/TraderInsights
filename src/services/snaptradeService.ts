import { SnapTradeConfig, SnapTradeUser } from "../lib/snaptrade/types";
import { getSnapTradeConfig } from "../lib/snaptrade/config";
import { StorageHelpers, STORAGE_KEYS } from "../lib/snaptrade/storage";
import { createSnapTradeClient } from "../lib/snaptrade/client";
import {
  generateAuthHeaders,
  makeSnapTradeRequest,
} from "../lib/snaptrade/auth";

// Create the service object
export const snapTradeService = {
  initialize: async (config: SnapTradeConfig) => {
    try {
      console.log("Initializing SnapTrade service with config:", {
        hasClientId: !!config.clientId,
        hasConsumerKey: !!config.consumerKey,
        redirectUri: config.redirectUri,
      });

      if (!config.clientId || !config.consumerKey) {
        throw new Error("Missing required SnapTrade configuration");
      }

      // Store config for later use
      StorageHelpers.setConfig(config);
      return true;
    } catch (error) {
      console.error("Error initializing SnapTrade service:", error);
      throw error;
    }
  },

  isUserRegistered: (): boolean => {
    const user = StorageHelpers.getUser();
    const isRegistered = user !== null && !!user.userId && !!user.userSecret;
    console.log("Checking if user is registered:", {
      isRegistered,
      hasUser: !!user,
    });
    return isRegistered;
  },

  registerUser: async (userId: string) => {
    try {
      console.log("Registering user:", userId);

      // Get config for proper credentials
      const config = getSnapTradeConfig();

      // In demo mode, use fixed credentials
      if (config.isDemo) {
        const demoUser = {
          userId: "demo-user",
          userSecret: "demo-secret",
        };
        StorageHelpers.saveUser(demoUser);
        return demoUser;
      }

      // Use the centralized auth utilities
      try {
        // Define the expected response type
        interface RegisterResponse {
          userId: string;
          userSecret: string;
        }

        const response = await makeSnapTradeRequest<RegisterResponse>(
          config,
          "/snapTrade/registerUser",
          "POST",
          { userId }
        );

        console.log("User registration successful:", {
          hasUserSecret: !!response.userSecret,
        });

        // Store user data
        if (response && response.userSecret) {
          const userData = {
            userId,
            userSecret: response.userSecret,
          };

          StorageHelpers.saveUser(userData);
          return userData;
        } else {
          throw new Error("Invalid response: missing userSecret");
        }
      } catch (error) {
        console.error("Failed to register with SnapTrade:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      const response = await fetch("/api/snaptrade/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete user: ${JSON.stringify(errorData)}`);
      }

      StorageHelpers.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  checkApiStatus: async () => {
    try {
      const response = await fetch("/api/snaptrade/status");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to check API status: ${JSON.stringify(errorData)}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error("Error checking API status:", error);
      throw error;
    }
  },

  getUser: (): SnapTradeUser | null => {
    return StorageHelpers.getUser();
  },

  getBrokerages: async () => {
    try {
      // Get config for proper credentials
      const config = getSnapTradeConfig();

      // Define the brokerage response type
      interface BrokerageResponse {
        id: string;
        name: string;
        slug: string;
        url: string;
        logo: string;
        status: string;
        [key: string]: any;
      }

      // Try direct API call first
      try {
        // Use the centralized auth utilities for direct API call
        const response = await makeSnapTradeRequest<BrokerageResponse[]>(
          config,
          "/referenceData/brokerages",
          "GET"
        );

        if (response && Array.isArray(response)) {
          console.log(`Got ${response.length} brokerages from direct API call`);
          return response;
        }
      } catch (directApiError) {
        console.warn(
          "Direct API call failed, falling back to proxy:",
          directApiError
        );
      }

      // Fallback to proxy
      const response = await fetch("/api/snaptrade/brokerages");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to get brokerages: ${JSON.stringify(errorData)}`
        );
      }

      const data = await response.json();
      console.log(`Got ${data.length} brokerages from proxy API`);
      return data;
    } catch (error) {
      console.error("Error getting brokerages:", error);
      throw error;
    }
  },

  async createConnectionLink(
    userId: string,
    userSecret: string
  ): Promise<{ redirectUri: string }> {
    try {
      const response = await this.makeSnapTradeRequest("/snapTrade/login", {
        method: "POST",
        body: JSON.stringify({ userId, userSecret }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create connection link");
      }

      const data = await response.json();
      if (!data.redirectUri) {
        throw new Error("No redirect URI in response");
      }
      return { redirectUri: data.redirectUri };
    } catch (error) {
      console.error("Error creating connection link:", error);
      throw error;
    }
  },

  connections: {
    list: async () => {
      try {
        const config = getSnapTradeConfig();
        const user = StorageHelpers.getUser();

        if (!user || !user.userId || !user.userSecret) {
          throw new Error("User not properly registered");
        }

        // Use direct API call with auth utilities
        try {
          const response = await makeSnapTradeRequest(
            config,
            "/authorizations",
            "GET",
            {
              userId: user.userId,
              userSecret: user.userSecret,
            }
          );

          return response;
        } catch (directApiError) {
          console.warn(
            "Direct API call failed, falling back to SDK:",
            directApiError
          );

          // Fallback to SDK
          const client = await createSnapTradeClient(config);
          const response = await client.connections.listBrokerageAuthorizations(
            {
              userId: user.userId,
              userSecret: user.userSecret,
            }
          );
          return response.data;
        }
      } catch (error) {
        console.error("Error listing connections:", error);
        throw error;
      }
    },

    delete: async (authorizationId: string) => {
      try {
        const config = getSnapTradeConfig();
        const user = StorageHelpers.getUser();

        if (!user || !user.userId || !user.userSecret) {
          throw new Error("User not properly registered");
        }

        const client = await createSnapTradeClient(config);
        const response = await client.connections.removeBrokerageAuthorization({
          authorizationId,
          userId: user.userId,
          userSecret: user.userSecret,
        });
        return response.data;
      } catch (error) {
        console.error("Error deleting connection:", error);
        throw error;
      }
    },
  },

  accountInformation: {
    listUserAccounts: async (params: {
      userId: string;
      userSecret: string;
    }) => {
      const response = await fetch("/api/snaptrade/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to list accounts: ${JSON.stringify(errorData)}`
        );
      }

      return await response.json();
    },

    getUserAccountPositions: async (params: {
      userId: string;
      userSecret: string;
      accountId: string;
    }) => {
      const response = await fetch("/api/snaptrade/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to get positions: ${JSON.stringify(errorData)}`
        );
      }

      return await response.json();
    },

    getUserAccountBalance: async (params: {
      userId: string;
      userSecret: string;
      accountId: string;
    }) => {
      const response = await fetch("/api/snaptrade/balances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get balances: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    },

    getUserAccountOrders: async (params: {
      userId: string;
      userSecret: string;
      accountId: string;
    }) => {
      const response = await fetch("/api/snaptrade/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get orders: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    },
  },
};

// Export individual functions for backward compatibility
export const registerUser = snapTradeService.registerUser;
export const deleteUser = snapTradeService.deleteUser;
export const checkApiStatus = snapTradeService.checkApiStatus;
export const getUser = snapTradeService.getUser;
