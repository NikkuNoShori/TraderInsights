import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";
import { getSnapTradeConfig } from "@/lib/snaptrade/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, userSecret } = req.body;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    // Get config to check if we're in demo mode
    const config = getSnapTradeConfig();

    // In demo mode, use a fixed userSecret
    const effectiveUserSecret = config.isDemo ? "demo-secret" : userSecret;

    // For non-demo mode, validate userSecret
    if (!config.isDemo && !effectiveUserSecret) {
      return res.status(400).json({
        error: "userSecret is required for non-demo mode",
      });
    }

    // Access environment variables - try both formats
    const consumerKey =
      process.env.SNAPTRADE_CONSUMER_KEY ||
      process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    const clientId =
      process.env.SNAPTRADE_CLIENT_ID || process.env.VITE_SNAPTRADE_CLIENT_ID;

    // In demo mode, use demo credentials
    const effectiveConsumerKey = config.isDemo
      ? "demo-consumer-key"
      : consumerKey || "";
    const effectiveClientId = config.isDemo ? "demo-client-id" : clientId || "";

    // Validate environment variables for non-demo mode
    if (!config.isDemo && (!effectiveConsumerKey || !effectiveClientId)) {
      return res.status(500).json({
        error: "Missing SnapTrade configuration",
        details:
          "Please ensure SNAPTRADE_CONSUMER_KEY and SNAPTRADE_CLIENT_ID are set in your environment",
      });
    }

    // Generate timestamp and signature for SnapTrade API
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create HMAC signature
    const signature = crypto
      .createHmac("sha256", effectiveConsumerKey)
      .update(`${effectiveClientId}${timestamp}`)
      .digest("hex");

    // In demo mode, return a mock response
    if (config.isDemo) {
      return res.status(200).json({
        redirectUri: "https://snaptrade.com/demo/connect",
        userId: "demo-user",
        userSecret: "demo-secret",
      });
    }

    // Make the request to SnapTrade API
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/login",
      data: { userId, userSecret: effectiveUserSecret },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: effectiveClientId,
      },
    });

    // Return the successful response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to create connection link:", error);

    // Handle errors from the SnapTrade API
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Handle other errors
    return res.status(500).json({
      error: "Failed to create connection link",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
