import { Request, Response } from "express";
import axios from "axios";
import { safeLogger, maskSensitiveData } from "../../../lib/utils/security";
import crypto from "crypto";

// Create a safe logger that masks sensitive data
// const safeLogger = { log: console.log, error: console.error, warn: console.warn };

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
  console.log(
    `Proxying API request: ${req.method} ${req.path}, query:`,
    req.query
  );

  // Extract the target endpoint from the path - more robust handling
  let path = req.path;
  let endpoint = "";

  // Handle /api/snaptrade/proxy/brokerages directly
  if (path.includes("/proxy/brokerages")) {
    endpoint = "/brokerages";
  }
  // Handle /api/snaptrade/proxy/referenceData/brokerages
  else if (path.includes("/proxy/referenceData/brokerages")) {
    endpoint = "/referenceData/brokerages";
  }
  // Handle direct /accounts endpoint
  else if (path.includes("/proxy/accounts")) {
    endpoint = "/accounts";
  }
  // Handle specific account endpoints
  else if (path.match(/\/proxy\/accounts\/[a-zA-Z0-9-]+/)) {
    const accountId = path.split("/accounts/")[1];
    endpoint = `/accounts/${accountId}`;
  }
  // Handle generic proxy paths
  else {
    // Extract from /proxy/ prefix in the path
    const proxyMatch = path.match(/\/proxy\/(.*)/);
    if (proxyMatch && proxyMatch[1]) {
      endpoint = "/" + proxyMatch[1];
    }
    // Try query parameter if path doesn't contain the endpoint
    else if (req.query.endpoint && typeof req.query.endpoint === "string") {
      endpoint = req.query.endpoint;
      if (!endpoint.startsWith("/")) {
        endpoint = "/" + endpoint;
      }
    }
  }

  console.log(`Resolved endpoint: ${endpoint}`);

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
        path: req.path,
        query: req.query,
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

    // Generate timestamp for authentication
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Generate signature using the clientId + timestamp format
    const signatureContent = `${SNAPTRADE_CLIENT_ID}${timestamp}`;
    const signature = crypto
      .createHmac("sha256", SNAPTRADE_CONSUMER_KEY)
      .update(signatureContent)
      .digest("hex");

    // Get query parameters from request (excluding endpoint)
    const queryParams = { ...req.query };
    delete queryParams.endpoint; // Remove endpoint from query params

    // Always add clientId and timestamp to queryParams for GET requests
    if (!queryParams.clientId) {
      queryParams.clientId = SNAPTRADE_CLIENT_ID;
    }
    if (!queryParams.timestamp) {
      queryParams.timestamp = timestamp;
    }

    // Prepare headers with authentication
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Signature: signature,
      Timestamp: timestamp,
      ClientId: SNAPTRADE_CLIENT_ID,
      "x-api-key": SNAPTRADE_CONSUMER_KEY, // Add API key header for all requests
    };

    // Handle specific account-related endpoints differently
    // These endpoints require userId and userSecret in the request body
    const isAccountsEndpoint =
      endpoint === "/accounts" ||
      endpoint.startsWith("/accounts/") ||
      endpoint.includes("/positions") ||
      endpoint.includes("/balances");

    let requestData = req.body || {};

    // All requests need clientId
    if (!requestData.clientId) {
      requestData.clientId = SNAPTRADE_CLIENT_ID;
    }

    // Special case for brokerages endpoint - ensure it works
    if (
      endpoint === "/brokerages" ||
      endpoint === "/referenceData/brokerages"
    ) {
      // Simple GET request with authentication headers
      console.log("Handling special brokerages endpoint");
      try {
        // Target URL is different for the two endpoints
        const targetUrl = `${SNAPTRADE_API_BASE}${
          endpoint === "/brokerages"
            ? "/brokerages"
            : "/referenceData/brokerages"
        }`;

        // Make the request to SnapTrade with proper authentication
        const response = await axios({
          method: "GET",
          url: targetUrl,
          params: {
            clientId: SNAPTRADE_CLIENT_ID,
            timestamp,
          },
          headers: headers,
        });

        // Return the response
        res.status(response.status).json(response.data);
        console.log(`API response: ${response.status} for GET ${endpoint}`);
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Brokerages request failed:", {
            status: error.response?.status,
            data: error.response?.data,
          });

          if (error.response) {
            res.status(error.response.status).json(error.response.data);
          } else {
            res.status(500).json({ error: "Failed to fetch brokerages" });
          }
          return;
        }

        res.status(500).json({ error: "Unknown error fetching brokerages" });
        return;
      }
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
          endpoint: endpoint,
        });

        // Always use GET for account endpoints with API key authentication
        const actualMethod = "GET";
        safeLogger.log(
          `Using ${actualMethod} for account endpoint with API key auth`
        );

        // Build the target URL carefully
        const targetUrl = `${SNAPTRADE_API_BASE}${endpoint}`;
        console.log(`Making API call to: ${targetUrl}`);

        try {
          // Make the API call with credentials as query parameters
          const response = await axios({
            method: actualMethod,
            url: targetUrl,
            params: {
              ...queryParams,
              clientId: SNAPTRADE_CLIENT_ID,
              userId,
              userSecret,
              timestamp,
            },
            headers: headers,
          });

          // Return the response
          res.status(response.status).json(response.data);
          console.log(
            `API response: ${response.status} for ${actualMethod} ${endpoint}`
          );
          return;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Account API request failed:", {
              status: error.response?.status,
              data: error.response?.data,
              headers: error.response?.headers,
            });

            if (error.response) {
              res.status(error.response.status).json(error.response.data);
            } else {
              res.status(500).json({
                error: "Failed to fetch account data",
                details: error.message,
              });
            }
            return;
          }

          res.status(500).json({
            error: "Unknown error processing account endpoint",
            details: error instanceof Error ? error.message : String(error),
          });
          return;
        }
      } else {
        safeLogger.warn("Missing credentials for accounts endpoint", {
          endpoint,
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

    // Build full URL
    const targetUrl = `${SNAPTRADE_API_BASE}${endpoint}`;
    console.log(`Making API call to: ${targetUrl}`);

    // Make the request to SnapTrade
    try {
      const response = await axios({
        method: req.method,
        url: targetUrl,
        params:
          req.method === "GET"
            ? { ...queryParams, clientId: SNAPTRADE_CLIENT_ID, timestamp }
            : undefined,
        data: req.method !== "GET" ? requestData : undefined,
        headers: headers,
      });

      // Return the response
      res.status(response.status).json(response.data);
      console.log(
        `API response: ${response.status} for ${req.method} ${endpoint}`
      );
      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`API error for ${req.path}:`, {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });

        if (error.response) {
          res.status(error.response.status).json(error.response.data);
        } else {
          res.status(500).json({
            error: "Failed to proxy request to SnapTrade API",
            details: error.message,
          });
        }
        return;
      }

      // Handle generic errors
      console.error(`Generic error for ${req.path}:`, error);
      res.status(500).json({
        error: "Failed to proxy request to SnapTrade API",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  } catch (error) {
    console.error(`API error for ${req.path}:`, error);

    // Format axios errors
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json({
        error: `SnapTrade API error: ${error.response.status}`,
        details: error.response.data,
      });
      return;
    }

    // Handle generic errors
    res.status(500).json({
      error: "Failed to proxy request to SnapTrade API",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
