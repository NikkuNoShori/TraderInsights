import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth";
import apiRouter from "./routes/api";
import snapTradeRouter from "./api/snaptrade"; // Keep this for backward compatibility
import { serverEnv } from "./utils/env";

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: serverEnv.isDevelopment
      ? "http://localhost:5173"
      : serverEnv.appUrl,
    credentials: true,
  })
);
app.use(express.json());

// Add debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[SERVER] Received request: ${req.method} ${req.originalUrl}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: serverEnv.apiRateLimit, // limit each IP to N requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api", apiRouter); // Use the API router that includes SnapTrade routes

// Keep this for backward compatibility
app.use("/api/snaptrade", snapTradeRouter);

// Error handling
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
);

// Start server
const port = serverEnv.port;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log("SnapTrade configuration:", {
    hasClientId: !!serverEnv.snapTrade.clientId,
    hasConsumerKey: !!serverEnv.snapTrade.consumerKey,
    redirectUri: serverEnv.snapTrade.redirectUri,
  });
});
