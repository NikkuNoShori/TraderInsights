import { Router } from "express";
import snapTradeRouter from "./snaptrade";

const router = Router();

// Mount sub-routers for different API sections
router.use("/snaptrade", snapTradeRouter);

export default router;
