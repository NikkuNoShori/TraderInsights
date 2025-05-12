import express, { Router } from "express";
import { handleSnapTradeProxy } from "./proxy";
import { registerUser } from "./registerUser";
import { login } from "./login";
import { getBrokerConnectionUrl } from "./broker-connect";

const router = Router();

// Parse JSON request bodies
router.use(express.json());

// Register specific API handlers
router.post("/register", registerUser);
router.post("/login", login);
router.post("/broker-connect", getBrokerConnectionUrl);

// Handle proxy requests - ensure we use wildcard matching
// This will match both /proxy and /proxy/* requests
router.all("/proxy", handleSnapTradeProxy);
router.all("/proxy/*", handleSnapTradeProxy);

// Special case for brokerages endpoint directly
router.get("/brokerages", handleSnapTradeProxy);

// Endpoint for listing users
router.get("/listUsers", (req, res) => {
  req.query.endpoint = "/snapTrade/listUsers";
  handleSnapTradeProxy(req, res);
});

// Export the router
export default router;
