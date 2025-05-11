import express, { Router } from "express";
import { handleSnapTradeProxy } from "./proxy";
import { registerUser } from "./registerUser";
import { login } from "./login";
import { getBrokerConnectionUrl } from "./broker-connect";

const router = Router();

// Parse JSON request bodies
router.use(express.json());

// Direct endpoints for SnapTrade operations
router.post("/registerUser", registerUser);
router.post("/login", login);

// New dedicated endpoint for reliable broker connections
router.post("/broker-connect", getBrokerConnectionUrl);

// Generic proxy for all SnapTrade API endpoints
router.use("/proxy", handleSnapTradeProxy);
router.use("/proxy/*", handleSnapTradeProxy);

// Endpoint for listing users
router.get("/listUsers", (req, res) => {
  req.query.endpoint = "/snapTrade/listUsers";
  handleSnapTradeProxy(req, res);
});

export default router;
