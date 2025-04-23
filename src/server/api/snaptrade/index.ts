import { Router } from "express";
import { SnapTradeClient } from "@/lib/snaptrade/client";
import { SnapTradeError } from "@/lib/snaptrade/types";

const router = Router();
const client = new SnapTradeClient({
  clientId: process.env.SNAPTRADE_CLIENT_ID!,
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY!,
  isDemo: process.env.NODE_ENV === "development",
});

// Initialize SnapTrade client
router.get("/initialize", async (req, res) => {
  try {
    const status = await client.initialize();
    res.json(status);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Register user
router.post("/register", async (req, res) => {
  try {
    const { userId } = req.body;
    const response = await client.registerUser(userId);
    res.json(response);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get brokerages
router.get("/brokerages", async (req, res) => {
  try {
    const brokerages = await client.getBrokerages();
    res.json(brokerages);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get connections
router.get("/connections", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    const connections = await client.getConnections(userId);
    res.json(connections);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get accounts
router.get("/accounts", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    const accounts = await client.getAccounts(userId);
    res.json(accounts);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get account positions
router.get("/accounts/:accountId/positions", async (req, res) => {
  try {
    const { userId } = req.query;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    const positions = await client.getAccountPositions(userId, accountId);
    res.json(positions);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get account balances
router.get("/accounts/:accountId/balances", async (req, res) => {
  try {
    const { userId } = req.query;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    const balances = await client.getAccountBalances(userId, accountId);
    res.json(balances);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Get account orders
router.get("/accounts/:accountId/orders", async (req, res) => {
  try {
    const { userId } = req.query;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    const orders = await client.getAccountOrders(userId, accountId);
    res.json(orders);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
