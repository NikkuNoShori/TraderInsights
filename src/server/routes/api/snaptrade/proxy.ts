import { Router, RequestHandler, NextFunction } from "express";
import { handleSnapTradeProxy } from "./proxyHandler";

const router = Router();

// Handle all proxy requests
router.all("/", (req, res, next) => {
  console.log(`Handling proxy request: ${req.method} ${req.url}`);
  handleSnapTradeProxy(req, res, next);
});

// Handle all wildcard proxy/* requests
router.all("/*", (req, res, next) => {
  console.log(`Handling wildcard proxy request: ${req.method} ${req.url}`);
  // Extract the path after /proxy/
  const proxyPath = req.url.replace(/^\/+/, "");
  console.log(`Setting endpoint to: ${proxyPath}`);
  req.query.endpoint = `/${proxyPath}`;
  handleSnapTradeProxy(req, res, next);
});

export default router;
