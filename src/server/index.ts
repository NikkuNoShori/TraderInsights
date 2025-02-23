import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { authRouter } from "./routes/auth";
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: serverEnv.apiRateLimit, // limit each IP to N requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/auth", authRouter);

// Error handling
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
);

app.listen(serverEnv.port, () => {
  console.log(`Server running on port ${serverEnv.port}`);
});
