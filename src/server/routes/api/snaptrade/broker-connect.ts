import { Router, Request, Response, RequestHandler } from "express";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

const router = Router();

// Handle POST requests to /api/snaptrade/broker-connect
const brokerConnectHandler: RequestHandler = async (req, res, next) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Extract parameters from either body or query string
    const userId = req.body.userId || req.query.userId;
    const userSecret = req.body.userSecret || req.query.userSecret;
    const requestClientId = req.body.clientId || req.query.clientId;
    const brokerId = req.body.brokerId || req.query.brokerId;
    const redirectUri = req.body.redirectUri || req.query.redirectUri;

    // Log the request parameters for debugging (safely)
    console.log("Request params:", {
      hasBodyUserId: !!req.body.userId,
      hasQueryUserId: !!req.query.userId,
      hasBodyUserSecret: !!req.body.userSecret,
      hasQueryUserSecret: !!req.query.userSecret,
      hasBodyClientId: !!req.body.clientId,
      hasQueryClientId: !!req.query.clientId,
    });

    // Validate inputs
    if (!userId || !userSecret) {
      res.status(400).json({
        error: "Both userId and userSecret are required",
        message: "Please provide userId and userSecret parameters",
      });
      return;
    }

    // Validate userSecret format (basic validation)
    if (typeof userSecret !== "string" || userSecret.length < 10) {
      res.status(400).json({
        error: "Invalid userSecret format",
        message:
          "userSecret appears to be malformed. Please re-register with SnapTrade.",
      });
      return;
    }

    // Get SnapTrade credentials - prefer those from the request if provided
    const clientId = requestClientId || process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // Log the request (safely) - only log essential info, not the entire request
    console.log("Broker connection request:", {
      userId: userId.substring(0, 8) + "...",
      brokerId: brokerId || "ALL",
      hasRedirectUri: !!redirectUri,
      hasClientId: !!clientId,
      userSecretLength: userSecret ? userSecret.length : 0,
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

    // Log the SnapTrade request details for debugging
    console.log("SnapTrade request details:", {
      url: "https://api.snaptrade.com/api/v1/snapTrade/login",
      hasTimestamp: !!timestamp,
      hasSignature: !!signature,
      hasClientId: !!clientId,
      consumerKeyLength: consumerKey ? consumerKey.length : 0,
      body: {
        hasUserId: !!requestBody.userId,
        hasUserSecret: !!requestBody.userSecret,
        hasBroker: !!requestBody.broker,
        hasRedirectUri: !!requestBody.redirectUri,
      },
    });

    // Construct the URL with query parameters as the API seems to expect
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    queryParams.append("userSecret", userSecret);
    if (requestBody.broker) {
      queryParams.append("broker", requestBody.broker);
    }
    if (requestBody.redirectUri) {
      queryParams.append("redirectUri", requestBody.redirectUri);
    }
    queryParams.append("connectionType", "trade");

    // Construct the full URL
    const apiUrl = `https://api.snaptrade.com/api/v1/snapTrade/login?${queryParams.toString()}`;
    console.log("API URL (redacted):", apiUrl.replace(userSecret, "[SECRET]"));

    // Make the API request using direct axios call
    const response = await axios({
      method: "get", // Switch to GET with query params since that seems to be what the API expects
      url: apiUrl,
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
      res.status(500).json({
        error: "Invalid response from SnapTrade",
        message: "No redirect URI returned from SnapTrade API",
      });
      return;
    }

    // Log the redirectUri (safely)
    console.log("Received redirect URI", {
      uriLength: responseRedirectUri.length,
      uriStart: responseRedirectUri.substring(0, 30) + "...",
    });

    // Success - return the redirect URI
    res.status(200).json({
      redirectUri: responseRedirectUri,
      status: "success",
    });
    return;
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
    res.status(statusCode).json({
      error: "SnapTrade API error",
      status: statusCode,
      message: errorMessage,
    });
    return;
  }
};

router.post("/", brokerConnectHandler);

export default router;
