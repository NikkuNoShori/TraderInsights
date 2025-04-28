import { Router } from "express";
import { handleSnapTradeWebhook } from "../api/webhooks/snaptrade";

const router = Router();

// SnapTrade webhook endpoint
router.post("/snaptrade", handleSnapTradeWebhook);

export default router;
