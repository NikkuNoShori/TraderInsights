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
    const { userId } = req.body;

    // Validate userId
    if (!userId || typeof userId !== "string") {
      return res
        .status(400)
        .json({ error: "A valid userId string is required" });
    }

    // Access environment variables - try both formats
    const consumerKey =
      process.env.SNAPTRADE_CONSUMER_KEY ||
      process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    const clientId =
      process.env.SNAPTRADE_CLIENT_ID || process.env.VITE_SNAPTRADE_CLIENT_ID;

    // Log the environment variable status for debugging
    console.log("Environment check:", {
      hasConsumerKey: !!consumerKey,
      hasClientId: !!clientId,
      nodeEnv: process.env.NODE_ENV,
      clientIdValue: clientId,
    });

    // Validate environment variables
    if (!consumerKey || !clientId) {
      return res.status(500).json({
        error: "Missing SnapTrade configuration",
        details:
          "Please ensure SNAPTRADE_CONSUMER_KEY and SNAPTRADE_CLIENT_ID are set in your environment",
      });
    }

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create HMAC signature
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log("Authentication parameters:", {
      clientId,
      timestamp,
      signatureBase: `${clientId}${timestamp}`,
      signatureLength: signature.length,
    });

    // Instead of using the SDK, make a direct API call to SnapTrade
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
      data: { userId },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("SnapTrade registration response:", response.data);

    if (!response.data?.userSecret) {
      throw new Error(
        "Failed to register user with SnapTrade - no user secret returned"
      );
    }

    return res.status(200).json({
      userId,
      userSecret: response.data.userSecret,
    });
  } catch (error) {
    console.error("Failed to register user:", error);

    // Improved error handling to provide more context
    let errorMessage = error instanceof Error ? error.message : String(error);
    let statusCode = 500;
    let errorData = {};

    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorData = error.response.data;
      console.error("API error response:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    const errorResponse = {
      error: `Failed to register user: ${errorMessage}`,
      details: errorData,
      timestamp: new Date().toISOString(),
    };

    console.error("Error response:", errorResponse);
    return res.status(statusCode).json(errorResponse);
  }
}
