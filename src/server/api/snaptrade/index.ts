import { Router, Request, Response } from "express";
import { snapTradeClient } from "@/lib/snaptrade/client";
import { SnapTradeError } from "@/lib/snaptrade/types";

const router = Router();

router.get("/initialize", async (_req: Request, res: Response) => {
  try {
    const status = await snapTradeClient.initialize();
    res.json(status);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const response = await snapTradeClient.registerUser(userId);
    res.json(response);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/brokerages", async (_req: Request, res: Response) => {
  try {
    const brokerages = await snapTradeClient.getBrokerageList();
    res.json(brokerages);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/connections", async (req: Request, res: Response) => {
  try {
    const { userId, userSecret } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const connections = await snapTradeClient.getConnections(
      userId,
      userSecret
    );
    res.json(connections);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const { userId, userSecret } = req.query;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const accounts = await snapTradeClient.getAccounts(userId, userSecret);
    res.json(accounts);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.statusCode || 500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

router.get(
  "/accounts/:accountId/positions",
  async (req: Request, res: Response) => {
    try {
      const { userId, userSecret } = req.query;
      const { accountId } = req.params;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }
      if (!userSecret || typeof userSecret !== "string") {
        return res.status(400).json({ error: "userSecret is required" });
      }
      const positions = await snapTradeClient.getAccountPositions(
        userId,
        userSecret,
        accountId
      );
      res.json(positions);
    } catch (error) {
      if (error instanceof SnapTradeError) {
        res.status(error.statusCode || 500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.get(
  "/accounts/:accountId/balances",
  async (req: Request, res: Response) => {
    try {
      const { userId, userSecret } = req.query;
      const { accountId } = req.params;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }
      if (!userSecret || typeof userSecret !== "string") {
        return res.status(400).json({ error: "userSecret is required" });
      }
      const balances = await snapTradeClient.getAccountBalance(
        userId,
        userSecret,
        accountId
      );
      res.json(balances);
    } catch (error) {
      if (error instanceof SnapTradeError) {
        res.status(error.statusCode || 500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

router.get(
  "/accounts/:accountId/quotes",
  async (req: Request, res: Response) => {
    try {
      const { userId, userSecret, symbols } = req.query;
      const { accountId } = req.params;
      if (!userId || typeof userId !== "string") {
        return res.status(400).json({ error: "userId is required" });
      }
      if (!userSecret || typeof userSecret !== "string") {
        return res.status(400).json({ error: "userSecret is required" });
      }
      if (!symbols || typeof symbols !== "string") {
        return res.status(400).json({ error: "symbols is required" });
      }
      const quotes = await snapTradeClient.getUserAccountQuotes(
        userId,
        userSecret,
        accountId,
        symbols.split(",").join(",")
      );
      res.json(quotes);
    } catch (error) {
      if (error instanceof SnapTradeError) {
        res.status(error.statusCode || 500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
);

const snaptradeApi = {
  client: snapTradeClient,
};

export default router;
export { snaptradeApi };
