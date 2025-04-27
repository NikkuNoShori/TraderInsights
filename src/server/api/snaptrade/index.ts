import { Router, Request, Response, RequestHandler } from "express";
import { snapTradeClient } from "@/lib/snaptrade/client";
import { SnapTradeError } from "@/lib/snaptrade/errors";

const router: Router = Router();
const client = snapTradeClient;

interface QueryParams {
  userId?: string;
  userSecret?: string;
}

// Register endpoint
router.post("/register", (async (req: Request, res: Response) => {
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
}) as RequestHandler);

// List brokerages endpoint
router.get("/brokerages", (async (_req: Request, res: Response) => {
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
}) as RequestHandler);

// List connections endpoint
router.get("/connections", (async (req: Request, res: Response) => {
  try {
    const { userId, userSecret } = req.query as QueryParams;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const connections = await client.getConnections(userId, userSecret);
    res.json(connections);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}) as RequestHandler);

// List accounts endpoint
router.get("/accounts", (async (req: Request, res: Response) => {
  try {
    const { userId, userSecret } = req.query as QueryParams;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const accounts = await client.getAccounts(userId, userSecret);
    res.json(accounts);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}) as RequestHandler);

// Get account positions endpoint
router.get("/accounts/:accountId/positions", (async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, userSecret } = req.query as QueryParams;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const positions = await client.getAccountPositions(
      userId,
      userSecret,
      accountId
    );
    res.json(positions);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}) as RequestHandler);

// Get account balances endpoint
router.get("/accounts/:accountId/balances", (async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, userSecret } = req.query as QueryParams;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const balances = await client.getAccountBalances(
      userId,
      userSecret,
      accountId
    );
    res.json(balances);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}) as RequestHandler);

// Get account orders endpoint
router.get("/accounts/:accountId/orders", (async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, userSecret } = req.query as QueryParams;
    const { accountId } = req.params;
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }
    if (!userSecret || typeof userSecret !== "string") {
      return res.status(400).json({ error: "userSecret is required" });
    }
    const orders = await client.getUserAccountOrders(
      userId,
      userSecret,
      accountId
    );
    res.json(orders);
  } catch (error) {
    if (error instanceof SnapTradeError) {
      res.status(error.status).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}) as RequestHandler);

export const snaptradeApi = {
  client: snapTradeClient,
};

export default router;
