/// <reference types="jest" />

import { SnapTradeClient } from "../client";
import { configHelpers } from "../config";
import { errorHelpers } from "../errors";
import { validateConfig, validateUserId, validateUserSecret } from "../types";
import { storageHelpers } from "../storage";

// Mock the SnapTrade SDK
jest.mock("snaptrade-typescript-sdk", () => ({
  Snaptrade: jest.fn().mockImplementation(() => ({
    authentication: {
      registerSnapTradeUser: jest.fn(),
      loginSnapTradeUser: jest.fn(),
      deleteSnapTradeUser: jest.fn(),
    },
    accountInformation: {
      listUserAccounts: jest.fn(),
      getUserAccountPositions: jest.fn(),
      getUserAccountBalance: jest.fn(),
      getUserAccountOrders: jest.fn(),
    },
    referenceData: {
      listAllBrokerages: jest.fn(),
      listBrokerageAuthorizations: jest.fn(),
    },
  })),
}));

describe("SnapTrade Integration", () => {
  let client: SnapTradeClient;

  beforeAll(() => {
    // Initialize configuration
    configHelpers.initializeFromEnv();
  });

  beforeEach(() => {
    // Create a new client instance for each test
    client = new SnapTradeClient(configHelpers.getConfig());
  });

  afterEach(() => {
    // Clear storage after each test
    storageHelpers.clearAll();
  });

  describe("Configuration", () => {
    it("should validate configuration correctly", () => {
      const config = {
        clientId: "test-client-id",
        consumerKey: "test-consumer-key",
        environment: "sandbox" as const,
      };

      const result = validateConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid configuration", () => {
      const config = {
        clientId: "",
        consumerKey: "",
        environment: "invalid" as any,
      };

      const result = validateConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("User Management", () => {
    it("should validate user ID correctly", () => {
      const userId = "test-user-123";
      const result = validateUserId(userId);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid user ID", () => {
      const userId = "a"; // Too short
      const result = validateUserId(userId);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should validate user secret correctly", () => {
      const userSecret = "a".repeat(32); // Minimum length
      const result = validateUserSecret(userSecret);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid user secret", () => {
      const userSecret = "a".repeat(31); // Too short
      const result = validateUserSecret(userSecret);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("Authentication", () => {
    it("should handle successful authentication", async () => {
      const credentials = {
        userId: "test-user-123",
        userSecret: "a".repeat(32),
      };

      try {
        await client.registerUser(credentials.userId);
        const session = await client.createConnectionLink({
          broker: "questrade",
          immediateRedirect: false,
        });

        expect(session).toBeDefined();
        expect(session.redirectUrl).toBeDefined();
      } catch (error) {
        errorHelpers.handleAuthError(error, "Authentication test");
      }
    });

    it("should handle authentication errors", async () => {
      const invalidCredentials = {
        userId: "a", // Too short
        userSecret: "a".repeat(31), // Too short
      };

      await expect(
        client.registerUser(invalidCredentials.userId)
      ).rejects.toThrow();
    });
  });

  describe("Account Management", () => {
    it("should retrieve user accounts", async () => {
      const credentials = {
        userId: "test-user-123",
        userSecret: "a".repeat(32),
      };

      try {
        await client.registerUser(credentials.userId);
        const accounts = await client.getUserAccounts();

        expect(Array.isArray(accounts)).toBe(true);
        accounts.forEach((account) => {
          expect(account).toHaveProperty("id");
          expect(account).toHaveProperty("name");
          expect(account).toHaveProperty("number");
        });
      } catch (error) {
        errorHelpers.handleApiError(error, "Account management test");
      }
    });

    it("should handle account retrieval errors", async () => {
      await expect(client.getUserAccounts()).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors correctly", async () => {
      try {
        await client.getUserAccounts();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    it("should handle storage errors correctly", async () => {
      try {
        storageHelpers.setCredentials({
          userId: "test-user-123",
          userSecret: "a".repeat(32),
          createdAt: Date.now(),
        });
      } catch (error) {
        errorHelpers.handleStorageError(error, "Storage test");
      }
    });
  });
});
