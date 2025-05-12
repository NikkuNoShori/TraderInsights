import { Router } from "express";
import { handleSnapTradeProxy } from "../../../api/snaptrade/proxy";

const router = Router();

// Handle all proxy requests
router.all("/", (req, res) => {
  console.log(`Handling proxy request: ${req.method} ${req.url}`);
  handleSnapTradeProxy(req, res);
});

// Handle all wildcard proxy/* requests
router.all("/*", (req, res) => {
  console.log(`Handling wildcard proxy request: ${req.method} ${req.url}`);
  // Extract the path after /proxy/
  const proxyPath = req.url.replace(/^\/+/, "");
  console.log(`Setting endpoint to: ${proxyPath}`);
  req.query.endpoint = `/${proxyPath}`;
  handleSnapTradeProxy(req, res);
});

export default router;
