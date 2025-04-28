import { SnapTradeClient } from "../client";
import { SnapTradeError, SnapTradeErrorCode } from "../types";
import { Snaptrade } from "snaptrade-typescript-sdk";

describe("SnapTradeClient", () => {
  let client: SnapTradeClient;

  beforeEach(() => {
    client = new SnapTradeClient({
      clientId: "test-client-id",
      consumerKey: "test-consumer-key",
    });
  });

  describe("Configuration", () => {
    it("should initialize with valid configuration", () => {
      expect(client).toBeDefined();
      expect(client.getClient()).toBeInstanceOf(Snaptrade);
    });

    it("should throw error with invalid configuration", () => {
      expect(() => {
        new SnapTradeClient({
          clientId: "",
          consumerKey: "test-consumer-key",
        });
      }).toThrow();
    });
  });

  describe("User Management", () => {
    it("should register a new user", async () => {
      const mockResponse = {
        data: {
          userId: "test-user-id",
          userSecret: "test-user-secret",
        },
      };

      client.getClient().authentication.registerSnapTradeUser = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await client.registerUser();
      expect(result).toEqual(mockResponse.data);
      expect(
        client.getClient().authentication.registerSnapTradeUser
      ).toHaveBeenCalledWith({ userId: expect.any(String) });
    });

    it("should handle registration errors", async () => {
      client.getClient().authentication.registerSnapTradeUser = jest
        .fn()
        .mockRejectedValue(new Error("Registration failed"));

      await expect(client.registerUser()).rejects.toThrow(SnapTradeError);
    });

    it("should delete a user", async () => {
      // Set up authenticated state
      client["userId"] = "test-user-id";
      client["userSecret"] = "test-user-secret";

      client.getClient().authentication.deleteSnapTradeUser = jest
        .fn()
        .mockResolvedValue({ data: {} });

      await client.deleteUser();
      expect(
        client.getClient().authentication.deleteSnapTradeUser
      ).toHaveBeenCalledWith({ userId: "test-user-id" });
    });
  });

  describe("Account Management", () => {
    beforeEach(() => {
      // Set up authenticated state
      client["userId"] = "test-user-id";
      client["userSecret"] = "test-user-secret";
    });

    it("should get user accounts", async () => {
      const mockResponse = {
        data: [
          { id: "account-1", name: "Test Account" },
          { id: "account-2", name: "Another Account" },
        ],
      };

      client.getClient().accountInformation.listUserAccounts = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await client.getUserAccounts();
      expect(result).toEqual(mockResponse.data);
      expect(
        client.getClient().accountInformation.listUserAccounts
      ).toHaveBeenCalledWith({
        userId: "test-user-id",
        userSecret: "test-user-secret",
      });
    });

    it("should get account holdings", async () => {
      const mockResponse = {
        data: [
          { symbol: "AAPL", quantity: 100 },
          { symbol: "GOOGL", quantity: 50 },
        ],
      };

      client.getClient().accountInformation.getUserAccountPositions = jest
        .fn()
        .mockResolvedValue(mockResponse);

      const result = await client.getAccountHoldings("account-1");
      expect(result).toEqual(mockResponse.data);
      expect(
        client.getClient().accountInformation.getUserAccountPositions
      ).toHaveBeenCalledWith({
        userId: "test-user-id",
        userSecret: "test-user-secret",
        accountId: "account-1",
      });
    });

    it("should handle unauthenticated access", async () => {
      client["userId"] = "";
      client["userSecret"] = "";

      await expect(client.getUserAccounts()).rejects.toThrow(SnapTradeError);
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors", async () => {
      client.getClient().authentication.registerSnapTradeUser = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(client.registerUser()).rejects.toThrow(SnapTradeError);
    });

    it("should handle authentication errors", async () => {
      client.getClient().authentication.loginSnapTradeUser = jest
        .fn()
        .mockRejectedValue(new Error("Invalid credentials"));

      await expect(
        client.createConnectionLink({
          broker: "test-broker",
          immediateRedirect: false,
        })
      ).rejects.toThrow(SnapTradeError);
    });
  });
});
