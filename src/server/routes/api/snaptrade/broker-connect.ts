import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";

const router = Router();

// Handle POST requests to /api/snaptrade/broker-connect
router.post("/", async (req: Request, res: Response) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, userSecret, brokerId, redirectUri } = req.body;

    // Validate inputs
    if (!userId || !userSecret) {
      return res.status(400).json({
        error: "Both userId and userSecret are required",
      });
    }

    // Get SnapTrade credentials
    const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      return res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
    }

    // Log the request (safely) - only log essential info, not the entire request
    console.log("Broker connection request:", {
      userId: userId.substring(0, 8) + "...",
      brokerId: brokerId || "ALL",
      hasRedirectUri: !!redirectUri,
    });

    // Prepare the request body with required parameters
    const requestBody: Record<string, any> = {
      userId,
      userSecret,
      connectionType: "trade", // Always use trade connection type
      redirectUri: redirectUri || "http://localhost:5173/broker-callback", // Use provided redirect URI or fallback
    };

    // Add broker if specified
    if (brokerId && brokerId !== "ALL") {
      requestBody.broker = brokerId;
    }

    // Log the request details (safely)
    console.log("Making direct SnapTrade login request:", {
      hasUserId: !!userId,
      hasUserSecret: !!userSecret,
      broker: brokerId || "ALL",
      hasRedirectUri: !!requestBody.redirectUri,
    });

    // Generate timestamp and signature for auth method 1
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Make the API request using direct axios call
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/login",
      data: requestBody,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Include both authentication methods to ensure one works
        "x-api-key": consumerKey,
        "Client-Id": clientId,
        // Also include signature-based authentication as backup
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    // Log the response status
    console.log(`SnapTrade login response: ${response.status}`, {
      status: response.status,
      hasData: !!response.data,
    });

    // Extract the redirect URI from the response
    const responseRedirectUri =
      response.data.redirectUri || response.data.redirectURI;

    if (!responseRedirectUri) {
      console.error("No redirect URI in response", response.data);
      return res.status(500).json({
        error: "Invalid response from SnapTrade",
        message: "No redirect URI returned from SnapTrade API",
      });
    }

    // Log the redirectUri (safely)
    console.log("Received redirect URI", {
      uriLength: responseRedirectUri.length,
      uriStart: responseRedirectUri.substring(0, 30) + "...",
    });

    // Success - return the redirect URI
    return res.status(200).json({
      redirectUri: responseRedirectUri,
      status: "success",
    });
  } catch (error: any) {
    console.error(
      "Error getting broker connection URL:",
      error.response?.data || error.message
    );

    // Extract error message safely
    let errorMessage = "Error connecting to broker";
    let statusCode = 500;

    if (error.response) {
      statusCode = error.response.status;

      try {
        const data = error.response.data;
        errorMessage = data.detail || data.message || errorMessage;
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }
    }

    // Return a simplified error response
    return res.status(statusCode).json({
      error: "SnapTrade API error",
      status: statusCode,
      message: errorMessage,
    });
  }
});

export default router;
