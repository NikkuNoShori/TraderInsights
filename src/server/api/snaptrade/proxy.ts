import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
import { safeLogger, maskSensitiveData } from "../../../lib/utils/security";

// Load environment variables
dotenv.config();

// Get SnapTrade credentials from server environment - explicitly use VITE_ prefixed variables
const SNAPTRADE_CLIENT_ID = process.env.VITE_SNAPTRADE_CLIENT_ID;
const SNAPTRADE_CONSUMER_KEY = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

const SNAPTRADE_API_BASE = "https://api.snaptrade.com/api/v1";

/**
 * Server-side proxy handler for SnapTrade API requests
 * This proxy adapts authentication based on the target endpoint
 */
export const handleSnapTradeProxy = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Extract the target endpoint from the path
  const path = req.path.replace("/api/snaptrade/proxy", "");
  const endpoint = path || (req.query.endpoint as string) || "";

  try {
    // Special case for /debug endpoint - don't forward to SnapTrade
    if (endpoint === "/debug") {
      // Return environment variable status without exposing actual values
      res.status(200).json({
        message: "Environment variable check",
        server: {
          VITE_SNAPTRADE_CLIENT_ID: !!process.env.VITE_SNAPTRADE_CLIENT_ID,
          VITE_SNAPTRADE_CONSUMER_KEY:
            !!process.env.VITE_SNAPTRADE_CONSUMER_KEY,
        },
      });
      return;
    }

    if (!endpoint) {
      res.status(400).json({
        error: "Missing endpoint path or query parameter",
      });
      return;
    }

    // Validate that we have API credentials
    if (!SNAPTRADE_CLIENT_ID || !SNAPTRADE_CONSUMER_KEY) {
      safeLogger.error(
        "Missing SnapTrade API credentials in server environment"
      );
      res.status(500).json({
        error: "Server configuration error - Missing SnapTrade credentials",
        details:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // Log API credentials (masked) for debugging
    safeLogger.log("Using SnapTrade credentials:", {
      clientId: maskSensitiveData(SNAPTRADE_CLIENT_ID || ""),
      consumerKey: maskSensitiveData(SNAPTRADE_CONSUMER_KEY || ""),
    });

    // Get query parameters from request
    const queryParams = { ...req.query };
    delete queryParams.endpoint; // Remove endpoint from query params

    // Prepare headers - always include x-api-key as it's required for most endpoints
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": SNAPTRADE_CONSUMER_KEY,
    };

    // Handle specific account-related endpoints differently
    // These endpoints require userId and userSecret in the request body
    const isAccountsEndpoint =
      endpoint.includes("/accounts") ||
      endpoint.includes("/positions") ||
      endpoint.includes("/balances");

    let requestData = req.body || {};

    // All requests need clientId
    if (!requestData.clientId) {
      requestData.clientId = SNAPTRADE_CLIENT_ID;
    }

    // For accounts endpoints, ensure we handle authentication correctly
    if (isAccountsEndpoint) {
      // Extract credentials from query params or body
      const userId = queryParams.userId || (req.body && req.body.userId);
      const userSecret =
        queryParams.userSecret || (req.body && req.body.userSecret);

      if (userId && userSecret) {
        safeLogger.log("Found credentials for account endpoint", {
          hasUserId: !!userId,
          hasUserSecret: !!userSecret,
          method: req.method,
          isInQueryParams: !!(queryParams.userId && queryParams.userSecret),
          isInBody: !!(req.body && req.body.userId && req.body.userSecret),
        });

        // Ensure all account endpoints use POST with credentials in body
        if (req.method === "GET") {
          // Convert GET to POST
          safeLogger.log(
            "Converting GET to POST for account endpoint with credentials in body"
          );
          req.method = "POST"; // Change method internally
        }

        // Always ensure credentials are in the request body
        requestData = {
          ...requestData,
          userId,
          userSecret,
          clientId: SNAPTRADE_CLIENT_ID, // Always include clientId for account endpoints
        };

        // Remove from query params to avoid duplication
        delete queryParams.userId;
        delete queryParams.userSecret;
      } else {
        safeLogger.warn("Missing credentials for accounts endpoint", {
          hasQueryUserId: !!queryParams.userId,
          hasQueryUserSecret: !!queryParams.userSecret,
          hasBodyUserId: !!(req.body && req.body.userId),
          hasBodyUserSecret: !!(req.body && req.body.userSecret),
        });

        // Return early with error message if credentials are missing
        res.status(400).json({
          error: "Missing required credentials for account endpoint",
          details:
            "userId and userSecret are required for this SnapTrade endpoint",
        });
        return;
      }
    }

    // Log request details safely
    safeLogger.log(`Server proxy handling: ${req.method} ${endpoint}`, {
      method: req.method,
      apiKey: "Using x-api-key authentication",
      isAccountsEndpoint,
      hasClientId: !!requestData.clientId,
    });

    // Build full URL
    const targetUrl = `${SNAPTRADE_API_BASE}${endpoint}`;

    // Make the request to SnapTrade
    const response = await axios({
      method: req.method,
      url: targetUrl,
      params: req.method === "GET" ? queryParams : undefined,
      data: req.method !== "GET" ? requestData : undefined,
      headers: headers,
    });

    // Return the response
    res.status(response.status).json(response.data);
    return;
  } catch (error) {
    safeLogger.error("Server-side SnapTrade proxy error", {
      endpoint,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Log detailed error for debugging
      safeLogger.error("SnapTrade API error details:", {
        status,
        data: typeof data === "object" ? JSON.stringify(data) : String(data),
        endpoint,
      });

      // Handle user already exists specially
      if (
        status === 400 &&
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string" &&
        (data.detail.includes("already exist") ||
          data.detail.includes("already registered"))
      ) {
        // Return a nicer response for user already exists cases
        res.status(200).json({
          userId:
            typeof req.body === "object" &&
            req.body !== null &&
            "userId" in req.body
              ? req.body.userId
              : undefined,
          userSecret: "USER_ALREADY_EXISTS",
          warning: "User already exists in SnapTrade",
          detail: data.detail,
        });
        return;
      }

      // Return a simplified error response
      res.status(status).json({
        error: "SnapTrade API error",
        status: status,
        message:
          typeof data === "object" && data !== null && "detail" in data
            ? String(data.detail)
            : typeof data === "object" && data !== null && "message" in data
            ? String(data.message)
            : "Error communicating with SnapTrade API",
        endpoint,
      });
      return;
    }

    // Handle non-axios errors
    res.status(500).json({
      error: "Server-side proxy error",
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      endpoint,
    });
    return;
  }
};
