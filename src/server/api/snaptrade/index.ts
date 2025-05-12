import express, { Router } from "express";
import { handleSnapTradeProxy } from "./proxy";
import { registerUser } from "./registerUser";
import { login } from "./login";
import { getBrokerConnectionUrl } from "./broker-connect";

const router = Router();

// Parse JSON request bodies
router.use(express.json());

// Register specific API handlers
router.post("/register", (req, res) => {
  console.log("Handling register request via src/server/api/snaptrade");
  registerUser(req, res);
});

router.post("/login", (req, res) => {
  console.log("Handling login request via src/server/api/snaptrade");
  login(req, res);
});

router.post("/broker-connect", (req, res) => {
  console.log("Handling broker-connect request via src/server/api/snaptrade");
  getBrokerConnectionUrl(req, res);
});

// Handle proxy requests - ensure we use wildcard matching
// This will match both /proxy and /proxy/* requests
router.all("/proxy", handleSnapTradeProxy);
router.all("/proxy/*", handleSnapTradeProxy);

// Special cases for direct endpoint access
router.get("/brokerages", handleSnapTradeProxy);

// Add explicit route for snapTrade login used by the SnapTradeConnection component
router.post("/proxy/snapTrade/login", (req, res) => {
  console.log("Handling SnapTrade login request:", req.body);
  req.query.endpoint = "/auth/login";
  handleSnapTradeProxy(req, res);
});

// Enhanced handling for accounts endpoint - ensure GET requests work correctly
router.get("/accounts", (req, res) => {
  // Explicitly handle GET requests for accounts endpoint
  console.log("Handling accounts GET request with params:", req.query);
  req.query.endpoint = "/accounts";
  handleSnapTradeProxy(req, res);
});

// Also handle other HTTP methods for accounts
router.post("/accounts", (req, res) => {
  req.query.endpoint = "/accounts";
  handleSnapTradeProxy(req, res);
});

// Enhanced handling for specific account endpoints
router.all("/accounts/:accountId", (req, res) => {
  // Special case for specific account endpoint
  console.log(`Handling specific account request for accountId: ${req.params.accountId}`);
  req.query.endpoint = `/accounts/${req.params.accountId}`;
  handleSnapTradeProxy(req, res);
});

// Handle account positions endpoint
router.all("/accounts/:accountId/positions", (req, res) => {
  console.log(`Handling positions request for accountId: ${req.params.accountId}`);
  req.query.endpoint = `/accounts/${req.params.accountId}/positions`;
  handleSnapTradeProxy(req, res);
});

// Handle account balances endpoint
router.all("/accounts/:accountId/balances", (req, res) => {
  console.log(`Handling balances request for accountId: ${req.params.accountId}`);
  req.query.endpoint = `/accounts/${req.params.accountId}/balances`;
  handleSnapTradeProxy(req, res);
});

// Handle account orders endpoint
router.all("/accounts/:accountId/orders", (req, res) => {
  console.log(`Handling orders request for accountId: ${req.params.accountId}`);
  req.query.endpoint = `/accounts/${req.params.accountId}/orders`;
  handleSnapTradeProxy(req, res);
});

// Existing endpoints for positions and balances
router.all("/positions", (req, res) => {
  // Special case for positions endpoint
  req.query.endpoint = "/positions";
  handleSnapTradeProxy(req, res);
});

router.all("/balances", (req, res) => {
  // Special case for balances endpoint
  req.query.endpoint = "/balances";
  handleSnapTradeProxy(req, res);
});

// Endpoint for listing users
router.get("/listUsers", (req, res) => {
  req.query.endpoint = "/snapTrade/listUsers";
  handleSnapTradeProxy(req, res);
});

// Export the router
export default router;
