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
 * Express API handler for registering a user with SnapTrade
 * Following official SDK implementation
 */
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get userId from request body
    const { userId } = req.body;

    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      res.status(400).json({
        error: "Missing or invalid userId in request body",
      });
      return;
    }

    // Clean userId to prevent issues
    const cleanUserId = userId.trim();

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

    safeLogger.log("Attempting SnapTrade user registration");

    // Using the official SDK approach from screenshots
    try {
      // Common request parameters
      const apiUrl = "https://api.snaptrade.com/api/v1/snapTrade/registerUser";
      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Create signature as shown in SDK (clientId + timestamp)
      const signatureContent = `${clientId}${timestamp}`;
      const signature = crypto
        .createHmac("sha256", consumerKey)
        .update(signatureContent)
        .digest("hex");

      safeLogger.log("Request details:", {
        url: apiUrl,
        method: "POST",
        userId: maskSensitiveData(cleanUserId),
        signatureFormat: "clientId + timestamp (hex digest)",
        timestamp,
      });

      // Make direct API call to SnapTrade
      const response = await axios({
        method: "post",
        url: apiUrl,
        data: { userId: cleanUserId },
        params: { clientId, timestamp },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Signature: signature,
          Timestamp: timestamp,
          ClientId: clientId,
        },
      });

      safeLogger.log("SnapTrade registration successful");

      // Return successful response
      res.status(response.status).json(response.data);
      return;
    } catch (error: any) {
      // First attempt failed, try alternative signature method
      if (axios.isAxiosError(error) && error.response) {
        safeLogger.log(
          "First attempt failed, trying alternative signature format"
        );

        try {
          const apiUrl =
            "https://api.snaptrade.com/api/v1/snapTrade/registerUser";
          const timestamp = Math.floor(Date.now() / 1000).toString();

          // Alternative signature format (clientId & timestamp)
          const signatureContent = `${clientId}&${timestamp}`;
          const signature = crypto
            .createHmac("sha256", consumerKey)
            .update(signatureContent)
            .digest("hex");

          safeLogger.log("Alternative request details:", {
            url: apiUrl,
            method: "POST",
            userId: maskSensitiveData(cleanUserId),
            signatureFormat: "clientId & timestamp (hex digest)",
            timestamp,
          });

          // Make direct API call to SnapTrade
          const response = await axios({
            method: "post",
            url: apiUrl,
            data: { userId: cleanUserId },
            params: { clientId, timestamp },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Signature: signature,
              Timestamp: timestamp,
              ClientId: clientId,
            },
          });

          safeLogger.log(
            "SnapTrade registration successful with alternative signature"
          );

          // Return successful response
          res.status(response.status).json(response.data);
          return;
        } catch (fallbackError: any) {
          // Second attempt failed, try the JSON content signing method
          safeLogger.log(
            "Second attempt failed, trying JSON content signing method"
          );

          try {
            const apiUrl =
              "https://api.snaptrade.com/api/v1/snapTrade/registerUser";
            const timestamp = Math.floor(Date.now() / 1000).toString();

            // Prepare the content for JSON signing
            const contentToSign = {
              content: { userId: cleanUserId },
              path: "/api/v1/snapTrade/registerUser",
              query: `clientId=${clientId}&timestamp=${timestamp}`,
            };

            // Convert to JSON string
            const jsonContent = JSON.stringify(contentToSign);

            // Generate signature using base64 encoding
            const signature = crypto
              .createHmac("sha256", consumerKey)
              .update(jsonContent)
              .digest("base64");

            safeLogger.log("JSON content signing request details:", {
              url: apiUrl,
              method: "POST",
              userId: maskSensitiveData(cleanUserId),
              signatureFormat: "JSON content signing (base64)",
              timestamp,
            });

            // Make direct API call to SnapTrade
            const response = await axios({
              method: "post",
              url: apiUrl,
              data: { userId: cleanUserId },
              params: { clientId, timestamp },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Signature: signature,
                Timestamp: timestamp,
                ClientId: clientId,
                "Signature-Version": "2", // Specify that we're using version 2 signing
              },
            });

            safeLogger.log(
              "SnapTrade registration successful with JSON content signing"
            );

            // Return successful response
            res.status(response.status).json(response.data);
            return;
          } catch (jsonSigningError: any) {
            // Throw the most informative error
            throw jsonSigningError;
          }

          // If all attempts fail, throw the most recent error
          throw fallbackError;
        }
      } else {
        throw error;
      }
    }
  } catch (error) {
    safeLogger.error("Error registering user with SnapTrade");

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
            "Your SnapTrade credentials are not authorized for user registration. Please verify you're using the correct clientId and consumerKey.",
          details:
            "The clientId must match exactly what SnapTrade provided for your account. It appears the current clientId is not recognized by the SnapTrade API.",
          status: 401,
        });
        return;
      }

      // Handle signature verification issues
      if (
        status === 401 &&
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string" &&
        data.detail.includes("verify signature")
      ) {
        res.status(401).json({
          error: "SnapTrade Signature Error",
          message:
            "Your SnapTrade signature could not be verified. Please verify you're using the correct consumerKey.",
          details:
            "The signature generated with your consumerKey could not be verified by the SnapTrade API. This usually indicates the consumerKey is incorrect.",
          status: 401,
        });
        return;
      }

      // User already exists - treat as success with a warning
      if (
        status === 400 &&
        typeof data === "object" &&
        data !== null &&
        "detail" in data &&
        typeof data.detail === "string" &&
        (data.detail.includes("already exist") ||
          data.detail.includes("already registered"))
      ) {
        res.status(200).json({
          userId: req.body.userId,
          userSecret: "USER_ALREADY_EXISTS",
          warning: "User already exists in SnapTrade",
          detail: data.detail,
        });
        return;
      }

      // Return original error without exposing sensitive details
      res.status(status).json({
        error: "SnapTrade API error",
        status,
        message: "An error occurred while communicating with SnapTrade API",
        detail: data?.detail || "Unknown error",
      });
      return;
    }

    // Handle other errors without exposing details
    res.status(500).json({
      error: "Failed to register with SnapTrade",
      message: "An unexpected error occurred during registration",
    });
    return;
  }
};
