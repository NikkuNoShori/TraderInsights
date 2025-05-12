import { Router } from "express";
import registerUserRouter from "./registerUser";
import brokerConnectRouter from "./broker-connect";
import brokeragesRouter from "./brokerages";
import accountsRouter from "./accounts";
import proxyRouter from "./proxy";

const router = Router();

// Add debugging middleware to log all requests
router.use((req, res, next) => {
  console.log(`[SnapTrade API] ${req.method} ${req.url}`);
  next();
});

// Mount the individual route handlers
router.use("/register", registerUserRouter);
router.use("/broker-connect", brokerConnectRouter);
router.use("/brokerages", brokeragesRouter);
router.use("/accounts", accountsRouter);
router.use("/proxy", proxyRouter);

export default router;
