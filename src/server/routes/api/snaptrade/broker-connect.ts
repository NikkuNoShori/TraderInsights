import { Router } from "express";
import { getBrokerConnectionUrl } from "../../../../server/api/snaptrade/broker-connect";

const router = Router();

// Handle POST requests to /api/snaptrade/broker-connect
router.post("/", getBrokerConnectionUrl);

export default router;
