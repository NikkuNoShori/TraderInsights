import { Router } from "express";
import { handleSnapTradeProxy } from "./proxyHandler";

const router = Router();

// Handle all proxy requests
router.all("/", (req, res, _next) => {
  console.log(`Handling proxy request: ${req.method} ${req.url}`);
  handleSnapTradeProxy(req, res, _next);
});

// Handle all wildcard proxy/* requests
router.all("/*", (req, res, _next) => {
  console.log(`Handling wildcard proxy request: ${req.method} ${req.url}`);
  // Extract the path after /proxy/
  const proxyPath = req.url.replace(/^\/+/, "");
  console.log(`Setting endpoint to: ${proxyPath}`);
  req.query.endpoint = `/${proxyPath}`;
  handleSnapTradeProxy(req, res, _next);
});

export default router;
