import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the target endpoint from query params
    const { endpoint } = req.query;

    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({
        error: "Missing required 'endpoint' query parameter",
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

    // Parse the request body
    const body = req.body;

    // Prepare the URL for the SnapTrade API
    const apiUrl = `https://api.snaptrade.com/api/v1${endpoint}`;

    console.log(`Proxying ${req.method} request to ${apiUrl}`);

    // Make the request to SnapTrade API
    const response = await axios({
      method: req.method?.toLowerCase() || "get",
      url: apiUrl,
      data: req.method !== "GET" ? body : undefined,
      params: req.method === "GET" ? body : undefined,
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
    console.error("Proxy request failed:", error);

    // Handle errors from the SnapTrade API
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({
        error: "SnapTrade API error",
        status: error.response.status,
        data: error.response.data,
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: "Proxy request failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
