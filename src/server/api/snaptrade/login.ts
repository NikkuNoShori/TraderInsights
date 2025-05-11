import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import { safeLogger, maskSensitiveData } from "../../../lib/utils/security";

// Get environment variables with explicit VITE_ prefix
const getSnapTradeEnvVars = () => {
  const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID || "";
  const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";

  return { clientId, consumerKey };
};

/**
 * Express API handler for SnapTrade login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { userId, userSecret, broker, connectionType = "trade" } = req.body;

    // Validate inputs
    if (!userId) {
      res.status(400).json({
        error: "userId is required",
      });
      return;
    }

    if (!userSecret) {
      res.status(400).json({
        error: "userSecret is required",
      });
      return;
    }

    // Get SnapTrade credentials directly from environment
    const { clientId, consumerKey } = getSnapTradeEnvVars();

    // Log actual values (masked) for debugging
    safeLogger.log("SnapTrade API credentials:", {
      clientId: maskSensitiveData(clientId),
      consumerKey: maskSensitiveData(consumerKey),
    });

    if (!consumerKey || !clientId) {
      res.status(500).json({
        error: "Missing SnapTrade configuration",
        details:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // For login/connection, use direct access with API key instead of signatures
    // This is more reliable for this specific endpoint
    safeLogger.log("Using direct API key approach for login");

    try {
      // Create the request payload
      const payload: Record<string, any> = {
        userId,
        userSecret,
        connectionType,
      };

      // Only add broker if specified
      if (broker) {
        payload.broker = broker;
      }

      // Make direct API call to SnapTrade using API key
      const apiUrl = "https://api.snaptrade.com/api/v1/snapTrade/login";

      safeLogger.log("Sending login request with API key:", {
        url: apiUrl,
        method: "POST",
        hasApiKey: !!consumerKey,
        broker: broker || "ALL",
      });

      const response = await axios({
        method: "post",
        url: apiUrl,
        data: payload,
        params: { clientId },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": consumerKey,
        },
      });

      safeLogger.log("SnapTrade login successful with API key method");

      // Return successful response
      res.status(response.status).json(response.data);
      return;
    } catch (error) {
      // If API key method fails, fall back to all our previous methods
      safeLogger.log("API key method failed, trying fallback methods");

      // Original code with signature methods - keep for backward compatibility
      // Generate timestamp and signature for SnapTrade API
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac("sha256", consumerKey)
        .update(`${clientId}${timestamp}`)
        .digest("hex");

      safeLogger.log("Attempting SnapTrade login");
      safeLogger.log("API request details:", {
        url: "https://api.snaptrade.com/api/v1/snapTrade/login",
        method: "POST",
        userId: maskSensitiveData(userId),
        timestamp,
        signature: maskSensitiveData(signature),
        broker: broker || "none specified",
      });

      // Prepare request params
      const params: Record<string, any> = {
        userId,
        userSecret,
        connectionType,
      };

      // Only add broker if specified
      if (broker) {
        params.broker = broker;
      }

      // Try multiple signature methods in sequence
      try {
        // Method 1: Standard signature (clientId + timestamp)
        const response = await axios({
          method: "post",
          url: "https://api.snaptrade.com/api/v1/snapTrade/login",
          data: params,
          params: { clientId, timestamp },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Signature: signature,
            Timestamp: timestamp,
            ClientId: clientId,
          },
        });

        safeLogger.log("SnapTrade login successful with standard signature");
        res.status(response.status).json(response.data);
        return;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          safeLogger.log(
            "First method failed, trying alternative signature (clientId & timestamp)"
          );

          try {
            // Method 2: Alternative signature (clientId & timestamp)
            const timestamp2 = Math.floor(Date.now() / 1000).toString();
            const signatureAlt = crypto
              .createHmac("sha256", consumerKey)
              .update(`${clientId}&${timestamp2}`)
              .digest("hex");

            const response2 = await axios({
              method: "post",
              url: "https://api.snaptrade.com/api/v1/snapTrade/login",
              data: params,
              params: { clientId, timestamp: timestamp2 },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Signature: signatureAlt,
                Timestamp: timestamp2,
                ClientId: clientId,
              },
            });

            safeLogger.log(
              "SnapTrade login successful with alternative signature"
            );
            res.status(response2.status).json(response2.data);
            return;
          } catch (error2) {
            if (axios.isAxiosError(error2) && error2.response?.status === 401) {
              safeLogger.log(
                "Second method failed, trying JSON content signing method"
              );

              try {
                // Method 3: JSON content signing
                const timestamp3 = Math.floor(Date.now() / 1000).toString();

                // Prepare the content for JSON signing
                const contentToSign = {
                  content: params,
                  path: "/api/v1/snapTrade/login",
                  query: `clientId=${clientId}&timestamp=${timestamp3}`,
                };

                // Convert to JSON string
                const jsonContent = JSON.stringify(contentToSign);

                // Generate signature using base64 encoding
                const signatureJson = crypto
                  .createHmac("sha256", consumerKey)
                  .update(jsonContent)
                  .digest("base64");

                safeLogger.log("JSON content signing request details:", {
                  url: "https://api.snaptrade.com/api/v1/snapTrade/login",
                  method: "POST",
                  userId: maskSensitiveData(userId),
                  signatureFormat: "JSON content signing (base64)",
                  timestamp: timestamp3,
                });

                const response3 = await axios({
                  method: "post",
                  url: "https://api.snaptrade.com/api/v1/snapTrade/login",
                  data: params,
                  params: { clientId, timestamp: timestamp3 },
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Signature: signatureJson,
                    Timestamp: timestamp3,
                    ClientId: clientId,
                    "Signature-Version": "2", // Specify that we're using version 2 signing
                  },
                });

                safeLogger.log(
                  "SnapTrade login successful with JSON content signing"
                );
                res.status(response3.status).json(response3.data);
                return;
              } catch (error3) {
                // Try Method 4: Using x-api-key header authentication
                try {
                  safeLogger.log(
                    "Third method failed, trying x-api-key header method"
                  );

                  const timestamp4 = Math.floor(Date.now() / 1000).toString();

                  safeLogger.log("x-api-key header request details:", {
                    url: "https://api.snaptrade.com/api/v1/snapTrade/login",
                    method: "POST",
                    userId: maskSensitiveData(userId),
                    signatureFormat: "x-api-key header",
                    timestamp: timestamp4,
                  });

                  const response4 = await axios({
                    method: "post",
                    url: "https://api.snaptrade.com/api/v1/snapTrade/login",
                    data: params,
                    params: { clientId, timestamp: timestamp4 },
                    headers: {
                      "Content-Type": "application/json",
                      Accept: "application/json",
                      "x-api-key": consumerKey,
                      Timestamp: timestamp4,
                      ClientId: clientId,
                    },
                  });

                  safeLogger.log(
                    "SnapTrade login successful with x-api-key header method"
                  );
                  res.status(response4.status).json(response4.data);
                  return;
                } catch (error4) {
                  // All signature methods failed, throw the original error for standard error handling
                  throw error;
                }
              }
            } else {
              // Second attempt failed with a non-401 error, throw it for standard error handling
              throw error2;
            }
          }
        } else {
          // First attempt failed with a non-401 error, throw it for standard error handling
          throw error;
        }
      }
    }
  } catch (error) {
    safeLogger.error("Error with SnapTrade login");

    // Handle errors from the SnapTrade API
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      safeLogger.error("SnapTrade API error details:", {
        status,
        data: data ? JSON.stringify(data) : "No response data",
        errorType: data?.type || "Unknown error type",
      });

      // Handle specifically the invalid clientId error
      if (
        status === 401 &&
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string" &&
        data.detail.includes("Invalid clientId provided")
      ) {
        res.status(401).json({
          error: "SnapTrade Authentication Error",
          message:
            "Your SnapTrade credentials are not authorized for this operation. You may need to upgrade your API permissions or update your credentials.",
          details:
            "This error usually occurs when your SnapTrade account doesn't have sufficient permissions. You can still browse brokerages but cannot perform user operations.",
          status: 401,
        });
        return;
      }

      // Return error without exposing sensitive details
      res.status(status).json({
        error: "SnapTrade API error",
        status,
        message: "An error occurred while communicating with SnapTrade API",
      });
      return;
    }

    // Handle other errors without exposing details
    res.status(500).json({
      error: "Failed to login with SnapTrade",
      message: "An unexpected error occurred during login",
    });
    return;
  }
};
