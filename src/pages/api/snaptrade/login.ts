import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";

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
    if (!userId || !userSecret) {
      return res.status(400).json({
        error: "Both userId and userSecret are required",
      });
    }

    // Access environment variables - try both formats
    const consumerKey =
      process.env.SNAPTRADE_CONSUMER_KEY ||
      process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    const clientId =
      process.env.SNAPTRADE_CLIENT_ID || process.env.VITE_SNAPTRADE_CLIENT_ID;

    // Validate environment variables
    if (!consumerKey || !clientId) {
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
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Make the request to SnapTrade API
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/login",
      data: { userId, userSecret },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
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
