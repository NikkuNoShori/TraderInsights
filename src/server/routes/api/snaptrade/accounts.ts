import { Router } from "express";
import { handleSnapTradeProxy } from "./proxyHandler";

const router = Router();

// Handle GET requests to /api/snaptrade/accounts
router.get("/", (req, res, _next) => {
  console.log("Handling accounts GET request with params:", req.query);
  req.query.endpoint = "/accounts";
  handleSnapTradeProxy(req, res, _next);
});

// Handle POST requests to /api/snaptrade/accounts
router.post("/", (req, res, _next) => {
  console.log("Handling accounts POST request");
  req.query.endpoint = "/accounts";
  handleSnapTradeProxy(req, res, _next);
});

// Handle specific account endpoints
router.all("/:accountId", (req, res, _next) => {
  console.log(
    `Handling specific account request for accountId: ${req.params.accountId}`
  );
  req.query.endpoint = `/accounts/${req.params.accountId}`;
  handleSnapTradeProxy(req, res, _next);
});

// Handle account positions endpoint
router.all("/:accountId/positions", (req, res, _next) => {
  console.log(
    `Handling positions request for accountId: ${req.params.accountId}`
  );
  req.query.endpoint = `/accounts/${req.params.accountId}/positions`;
  handleSnapTradeProxy(req, res, _next);
});

// Handle account balances endpoint
router.all("/:accountId/balances", (req, res, _next) => {
  console.log(
    `Handling balances request for accountId: ${req.params.accountId}`
  );
  req.query.endpoint = `/accounts/${req.params.accountId}/balances`;
  handleSnapTradeProxy(req, res, _next);
});

// Handle account orders endpoint
router.all("/:accountId/orders", (req, res, _next) => {
  console.log(`Handling orders request for accountId: ${req.params.accountId}`);
  req.query.endpoint = `/accounts/${req.params.accountId}/orders`;
  handleSnapTradeProxy(req, res, _next);
});

export default router;
