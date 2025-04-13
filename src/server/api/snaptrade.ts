import { Router, Request, Response, RequestHandler } from "express";
import crypto from "crypto";
import { serverEnv } from "@/server/utils/env";

interface RegisterUserBody {
  userId: string;
}

interface CreateConnectionLinkBody {
  userId: string;
  userSecret: string;
}

const router = Router();

try {
  console.log("Initializing SnapTrade router...");
  const config = {
    clientId: serverEnv.snapTrade.clientId!,
    consumerKey: serverEnv.snapTrade.consumerKey!,
    redirectUri: serverEnv.snapTrade.redirectUri,
  };

  console.log("SnapTrade config:", {
    hasClientId: !!config.clientId,
    hasConsumerKey: !!config.consumerKey,
    redirectUri: config.redirectUri,
  });

  // Register user with SnapTrade
  const registerHandler: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.body;
      console.log("Registering user with SnapTrade:", { userId });

      if (!userId) {
        console.error("Missing userId in request body");
        res.status(400).json({ error: "userId is required" });
        return;
      }

      // Generate timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac("sha256", config.consumerKey)
        .update(`${config.clientId}${timestamp}`)
        .digest("hex");

      const response = await fetch(
        "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Signature: signature,
            Timestamp: timestamp,
            ClientId: config.clientId,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        res.status(response.status).json(errorData);
        return;
      }

      const data = await response.json();
      console.log("SnapTrade registration response:", data);
      res.json(data);
      return;
    } catch (error) {
      console.error("Failed to register user with SnapTrade:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      res.status(500).json({
        error: "Failed to register user",
        details: error instanceof Error ? error.message : String(error),
      });
      return;
    }
  };

  // Get brokerages
  const getBrokeragesHandler: RequestHandler = async (_req, res) => {
    try {
      console.log("Fetching brokerages from SnapTrade");

      // Generate timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac("sha256", config.consumerKey)
        .update(`${config.clientId}${timestamp}`)
        .digest("hex");

      const response = await fetch(
        "https://api.snaptrade.com/api/v1/brokerages",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Signature: signature,
            Timestamp: timestamp,
            ClientId: config.clientId,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        res.status(response.status).json(errorData);
        return;
      }

      const data = await response.json();
      console.log("SnapTrade brokerages response:", data);
      res.json(data);
      return;
    } catch (error) {
      console.error("Failed to get brokerages from SnapTrade:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      res.status(500).json({
        error: "Failed to get brokerages",
        details: error instanceof Error ? error.message : String(error),
      });
      return;
    }
  };

  // Create connection link
  const createConnectionLinkHandler: RequestHandler = async (req, res) => {
    try {
      const { userId, userSecret } = req.body;
      console.log("Creating connection link:", { userId });

      if (!userId || !userSecret) {
        console.error("Missing required fields:", {
          hasUserId: !!userId,
          hasUserSecret: !!userSecret,
        });
        res.status(400).json({ error: "userId and userSecret are required" });
        return;
      }

      // Generate timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac("sha256", config.consumerKey)
        .update(`${config.clientId}${timestamp}`)
        .digest("hex");

      const response = await fetch(
        "https://api.snaptrade.com/api/v1/snapTrade/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Signature: signature,
            Timestamp: timestamp,
            ClientId: config.clientId,
          },
          body: JSON.stringify({ userId, userSecret }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        res.status(response.status).json(errorData);
        return;
      }

      const data = await response.json();
      console.log("SnapTrade connection link response:", data);
      res.json(data);
      return;
    } catch (error) {
      console.error("Failed to create connection link:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      res.status(500).json({
        error: "Failed to create connection link",
        details: error instanceof Error ? error.message : String(error),
      });
      return;
    }
  };

  router.post("/register", registerHandler);
  router.get("/brokerages", getBrokeragesHandler);
  router.post("/connection-link", createConnectionLinkHandler);
} catch (error) {
  console.error("Failed to initialize SnapTrade router:", error);
  if (error instanceof Error) {
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
}

export const snapTradeRouter = router;
