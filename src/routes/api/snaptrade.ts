import { Request, Response } from "express";
import { SnapTradeClient } from "../../lib/snaptrade/client";
import { configManager, configHelpers } from "../../lib/snaptrade/config";
import { generateSnapTradeAuth } from "../../lib/snaptrade/auth";

// Initialize configuration if not already done
if (!configManager.isInitialized()) {
  configHelpers.initializeFromEnv();
}
const snapTradeClient = new SnapTradeClient(configManager.getConfig());

export const checkApiStatus = async (req: Request, res: Response) => {
  try {
    const status = await snapTradeClient.initialize();
    res.json({ status: "ok", message: "SnapTrade API is accessible" });
  } catch (error) {
    console.error("SnapTrade API status check failed:", error);
    res
      .status(500)
      .json({ status: "error", message: "SnapTrade API is not accessible" });
  }
};

export const listConnections = async (req: Request, res: Response) => {
  try {
    const auth = await generateSnapTradeAuth(configManager.getConfig());
    const connections = await snapTradeClient.getConnections();
    res.json(connections);
  } catch (error) {
    console.error("Failed to list connections:", error);
    res.status(500).json({ error: "Failed to list connections" });
  }
};

export const getAccountPositions = async (req: Request, res: Response) => {
  try {
    const { userId, userSecret, accountId } = req.body;
    if (!userId || !userSecret || !accountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const positions = await snapTradeClient.getAccountPositions({
      userId,
      userSecret,
      accountId,
    });
    res.json(positions);
  } catch (error) {
    console.error("Failed to get account positions:", error);
    res.status(500).json({ error: "Failed to get account positions" });
  }
};

export const getAccountBalance = async (req: Request, res: Response) => {
  try {
    const { userId, userSecret, accountId } = req.body;
    if (!userId || !userSecret || !accountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const balances = await snapTradeClient.getAccountBalances({
      userId,
      userSecret,
      accountId,
    });
    res.json(balances);
  } catch (error) {
    console.error("Failed to get account balance:", error);
    res.status(500).json({ error: "Failed to get account balance" });
  }
};

export const getAccountOrders = async (req: Request, res: Response) => {
  try {
    const { userId, userSecret, accountId } = req.body;
    if (!userId || !userSecret || !accountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const orders = await snapTradeClient.getAccountOrders({
      userId,
      userSecret,
      accountId,
    });
    res.json(orders);
  } catch (error) {
    console.error("Failed to get account orders:", error);
    res.status(500).json({ error: "Failed to get account orders" });
  }
};

export const listUserAccounts = async (req: Request, res: Response) => {
  try {
    const { userId, userSecret } = req.body;
    if (!userId || !userSecret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const accounts = await snapTradeClient.getAccounts({
      userId,
      userSecret,
    });
    res.json(accounts);
  } catch (error) {
    console.error("Failed to list user accounts:", error);
    res.status(500).json({ error: "Failed to list user accounts" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    const user = await snapTradeClient.registerUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    await snapTradeClient.deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
