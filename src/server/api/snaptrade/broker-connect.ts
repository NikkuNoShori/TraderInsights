import { Request, Response } from "express";
import axios from "axios";
import { safeLogger, maskSensitiveData } from "../../../lib/utils/security";

// Get environment variables with explicit VITE_ prefix
const getSnapTradeEnvVars = () => {
  const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID || "";
  const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";
  // Ensure values are defined
  if (!clientId || !consumerKey) {
    safeLogger.error("Missing SnapTrade environment variables");
  }
  return { clientId, consumerKey };
};

/**
 * Simplified endpoint focused only on broker connections
 * This endpoint uses the most reliable authentication method for SnapTrade
 */
export const getBrokerConnectionUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId, userSecret, brokerId, redirectUri } = req.body;

    // Validate inputs
    if (!userId || !userSecret) {
      res.status(400).json({
        error: "Both userId and userSecret are required",
      });
      return;
    }

    // Get SnapTrade credentials
    const { clientId, consumerKey } = getSnapTradeEnvVars();

    if (!clientId || !consumerKey) {
      res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // Log the request (safely) - only log essential info, not the entire request
    safeLogger.log("Broker connection request:", {
      userId: maskSensitiveData(userId),
      brokerId: brokerId || "ALL",
      hasRedirectUri: !!redirectUri,
    });

    // Prepare the API request
    const apiUrl = "https://api.snaptrade.com/api/v1/snapTrade/login";

    // Create the request body with required parameters
    const requestBody: Record<string, any> = {
      userId,
      userSecret,
      connectionType: "trade", // Always use trade connection type
      redirectUri: redirectUri || "http://localhost:5173/broker-callback", // Use provided redirect URI or fallback
    };

    // Add broker if specified (convert brokerId to broker parameter expected by API)
    if (brokerId && brokerId !== "ALL") {
      requestBody.broker = brokerId;
    }

    // Log the request details (safely)
    safeLogger.log("Making SnapTrade login request:", {
      apiUrl,
      hasUserId: !!userId,
      hasUserSecret: !!userSecret,
      broker: brokerId || "ALL",
      hasRedirectUri: !!requestBody.redirectUri,
    });

    // Make the API request using API key authentication
    const response = await axios({
      method: "post",
      url: apiUrl,
      data: requestBody,
      params: { clientId },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": consumerKey,
      },
    });

    // Log the response status
    safeLogger.log(`SnapTrade login response: ${response.status}`, {
      status: response.status,
      hasData: !!response.data,
    });

    // Extract the redirect URI from the response
    const responseRedirectUri =
      response.data.redirectUri || response.data.redirectURI;

    if (!responseRedirectUri) {
      safeLogger.error("No redirect URI in response", response.data);
      res.status(500).json({
        error: "Invalid response from SnapTrade",
        message: "No redirect URI returned from SnapTrade API",
      });
      return;
    }

    // Log the redirectUri (safely)
    safeLogger.log("Received redirect URI", {
      uriLength: responseRedirectUri.length,
      uriStart: responseRedirectUri.substring(0, 30) + "...",
    });

    // Success - return the redirect URI
    res.status(200).json({
      redirectUri: responseRedirectUri,
      status: "success",
    });
  } catch (error) {
    safeLogger.error("Error getting broker connection URL");

    // Log minimal error details to avoid circular references
    if (axios.isAxiosError(error)) {
      if (error.response) {
        safeLogger.error(`SnapTrade API error (${error.response.status})`, {
          status: error.response.status,
          data: error.response.data,
        });

        // Extract error message safely
        let errorMessage = "Error connecting to broker";
        if (error.response.data) {
          try {
            const data =
              typeof error.response.data === "object"
                ? error.response.data
                : { message: String(error.response.data) };

            errorMessage = data.detail || data.message || errorMessage;

            // Log more details about the error
            safeLogger.error("SnapTrade error details", {
              errorMessage,
              status: error.response.status,
              data:
                typeof data === "object" ? JSON.stringify(data) : String(data),
            });
          } catch {
            // Ignore parsing errors
          }
        }

        // Return a simplified error response
        res.status(error.response.status).json({
          error: "SnapTrade API error",
          status: error.response.status,
          message: errorMessage,
        });
        return;
      } else {
        safeLogger.error("Network error connecting to SnapTrade API");
      }
    } else if (error instanceof Error) {
      safeLogger.error(error.message);
    }

    // Handle other errors
    res.status(500).json({
      error: "Failed to get broker connection URL",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
