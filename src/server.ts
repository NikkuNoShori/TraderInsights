import express from "express";
import cors from "cors";
import snaptradeRouter from "./routes/api/snaptrade";

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : process.env.VITE_APP_URL,
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Mount SnapTrade proxy routes
app.use("/api/snaptrade", snaptradeRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
