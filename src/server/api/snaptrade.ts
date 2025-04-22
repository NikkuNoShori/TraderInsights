import { Router } from "express";
import { serverEnv } from "../utils/env";
import { RequestHandler } from "express";
import crypto from "crypto";

interface RegisterUserBody {
  userId: string;
}

interface CreateConnectionLinkBody {
  userId: string;
  userSecret: string;
  broker?: string;
  immediateRedirect?: boolean;
  customRedirect?: string;
  reconnect?: string;
  connectionType?: string;
  connectionPortalVersion?: string;
}

interface SnapTradeConfig {
  clientId: string;
  consumerKey: string;
  redirectUri: string;
}

const router = Router();

try {
  console.log("Initializing SnapTrade router...");

  // Get credentials from environment variables
  const config: SnapTradeConfig = {
    clientId:
      process.env.SNAPTRADE_CLIENT_ID ?? serverEnv.snapTrade.clientId ?? "",
    consumerKey:
      process.env.SNAPTRADE_CONSUMER_KEY ??
      serverEnv.snapTrade.consumerKey ??
      "",
    redirectUri:
      process.env.SNAPTRADE_REDIRECT_URI ??
      serverEnv.snapTrade.redirectUri ??
      "",
  };

  // Validate configuration
  if (!config.clientId || !config.consumerKey) {
    throw new Error(
      "Missing required SnapTrade configuration. Please check your environment variables."
    );
  }

  console.log("SnapTrade config:", {
    hasClientId: !!config.clientId,
    hasConsumerKey: !!config.consumerKey,
    redirectUri: config.redirectUri,
  });

  // Helper function to generate authentication headers
  const generateAuthHeaders = (timestamp: string): Record<string, string> => {
    if (!config.clientId || !config.consumerKey) {
      throw new Error("Missing required SnapTrade configuration");
    }

    const message = `${config.clientId}${timestamp}`;
    const signature = crypto
      .createHmac("sha256", config.consumerKey)
      .update(Buffer.from(message, "utf8"))
      .digest("hex");

    return {
      "Content-Type": "application/json",
      Signature: signature,
      Timestamp: timestamp,
      ClientId: config.clientId,
    };
  };

  // Register user with SnapTrade
  const registerHandler: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.body as RegisterUserBody;
      console.log("Registering user with SnapTrade:", { userId });

      if (!userId) {
        console.error("Missing userId in request body");
        res.status(400).json({ error: "userId is required" });
        return;
      }

      // Generate timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const headers = generateAuthHeaders(timestamp);

      const response = await fetch(
        `https://api.snaptrade.com/api/v1/snapTrade/registerUser?clientId=${config.clientId}&timestamp=${timestamp}`,
        {
          method: "POST",
          headers,
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
    } catch (error) {
      console.error("Failed to register user with SnapTrade:", error);
      res.status(500).json({
        error: "Failed to register user",
        details: error instanceof Error ? error.message : String(error),
      });
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
      const {
        userId,
        userSecret,
        broker,
        immediateRedirect = false,
        customRedirect = config.redirectUri,
        reconnect,
        connectionType = "read",
        connectionPortalVersion = "v4",
      } = req.body as CreateConnectionLinkBody;

      console.log("Creating connection link:", {
        userId,
        hasBroker: !!broker,
        customRedirect,
        connectionType,
      });

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
      const headers = generateAuthHeaders(timestamp);

      // Prepare request body with all required fields
      const requestBody: Record<string, string | boolean | undefined> = {
        userId,
        userSecret,
        broker,
        immediateRedirect,
        customRedirect,
        reconnect,
        connectionType,
        connectionPortalVersion,
      };

      // Remove undefined values
      Object.keys(requestBody).forEach((key) => {
        if (requestBody[key] === undefined) {
          delete requestBody[key];
        }
      });

      const response = await fetch(
        `https://api.snaptrade.com/api/v1/snapTrade/login?clientId=${config.clientId}&timestamp=${timestamp}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("SnapTrade API error:", errorData);
        res.status(response.status).json(errorData);
        return;
      }

      const data = await response.json();
      console.log("SnapTrade login response:", data);

      // Check for redirectURI (uppercase as per API docs)
      if (!data.redirectURI) {
        console.error("No redirectURI in SnapTrade response:", data);
        res.status(500).json({ error: "No redirectURI in response" });
        return;
      }

      // Return the response with the correct field names
      res.json({
        redirectURI: data.redirectURI,
        sessionId: data.sessionId,
        status: "success",
      });
    } catch (error) {
      console.error("Failed to create connection link:", error);
      res.status(500).json({
        error: "Failed to create connection link",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Register routes
  router.post("/register", registerHandler);
  router.post("/login", createConnectionLinkHandler);
  router.get("/brokerages", getBrokeragesHandler);
} catch (error) {
  console.error("Failed to initialize SnapTrade router:", error);
}

export default router;
