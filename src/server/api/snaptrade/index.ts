import { Router } from "express";
import { snapTradeClient } from "@/lib/snaptrade/client";
import { SnapTradeError, SnapTradeErrorCode } from "@/lib/snaptrade/types";

const router = Router();

// Initialize SnapTrade
router.post("/initialize", async (req, res) => {
  try {
    const { userId, userSecret } = req.body;
    if (!userId || !userSecret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const result = await snapTradeClient.loginUser({ userId, userSecret });
    res.json(result);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(
          error.code === SnapTradeErrorCode.AUTHENTICATION_ERROR ? 401 : 500
        )
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const result = await snapTradeClient.registerUser();
    res.json(result);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get brokerages
router.get("/brokerages", async (req, res) => {
  try {
    const brokerages = await snapTradeClient.getBrokerageList();
    res.json(brokerages);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create connection link
router.post("/connections", async (req, res) => {
  try {
    const { broker } = req.body;
    if (!broker) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const result = await snapTradeClient.createConnectionLink({ broker });
    res.json(result);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get accounts
router.get("/accounts", async (req, res) => {
  try {
    const { userId, userSecret } = req.query;
    if (!userId || !userSecret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const accounts = await snapTradeClient.getConnections({
      userId,
      userSecret,
    });
    res.json(accounts);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get account positions
router.get("/accounts/:accountId/positions", async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId, userSecret } = req.query;
    if (!userId || !userSecret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const positions = await snapTradeClient.getAccountPositions({
      userId,
      userSecret,
      accountId,
    });
    res.json(positions);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get account balances
router.get("/accounts/:accountId/balances", async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId, userSecret } = req.query;
    if (!userId || !userSecret) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const balances = await snapTradeClient.getAccountBalance({
      userId,
      userSecret,
      accountId,
    });
    res.json(balances);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get account quotes
router.get("/accounts/:accountId/quotes", async (req, res) => {
  try {
    const { accountId } = req.params;
    const { userId, userSecret, symbols } = req.query;
    if (!userId || !userSecret || !symbols) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const quotes = await snapTradeClient.getUserAccountQuotes({
      userId,
      userSecret,
      accountId,
      symbols: symbols as string,
    });
    res.json(quotes);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      return res
        .status(error.code === SnapTradeErrorCode.API_ERROR ? 400 : 500)
        .json({
          error: error.message,
        });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

const snaptradeApi = {
  client: snapTradeClient,
};

export default router;
export { snaptradeApi };
