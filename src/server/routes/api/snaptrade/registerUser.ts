import { Router, Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

const router = Router();

// Create a stable, immutable signature string format as per SnapTrade documentation
const generateSignature = (
  clientId: string,
  timestamp: string,
  secretKey: string
): string => {
  return crypto
    .createHmac("sha256", secretKey)
    .update(`${clientId}${timestamp}`)
    .digest("hex");
};

// Handle POST requests to /api/snaptrade/register
const registerHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    // Check if this is a signature test request
    if (req.query.testSignatures === "true") {
      console.log("Running signature format tests...");
      const userId = req.body.userId || `test-user-${Date.now()}`;
      const apiClientId =
        req.body.clientId || process.env.VITE_SNAPTRADE_CLIENT_ID || "";
      const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";

      if (!apiClientId || !consumerKey) {
        return res.status(500).json({
          error: "Missing SnapTrade API credentials",
        });
      }

      const timestamp = Math.floor(Date.now() / 1000).toString();

      // Test multiple signature formats
      const signatureFormats = {
        docsFormat: crypto
          .createHmac("sha256", consumerKey)
          .update(`${apiClientId}${timestamp}`)
          .digest("hex"),
        withoutUserId: crypto
          .createHmac("sha256", consumerKey)
          .update(`${apiClientId}:${timestamp}`)
          .digest("hex"),
        withUserId: crypto
          .createHmac("sha256", consumerKey)
          .update(`${userId}:${apiClientId}:${timestamp}`)
          .digest("hex"),
        userIdFirst: crypto
          .createHmac("sha256", consumerKey)
          .update(`${userId}${apiClientId}${timestamp}`)
          .digest("hex"),
        timestampFirst: crypto
          .createHmac("sha256", consumerKey)
          .update(`${timestamp}${apiClientId}`)
          .digest("hex"),
      };

      console.log("Testing signature formats:", Object.keys(signatureFormats));

      // Test each format in sequence
      const results = [];
      for (const [format, signature] of Object.entries(signatureFormats)) {
        console.log(
          `Testing format: ${format} with signature: ${signature.substring(
            0,
            10
          )}...`
        );
        try {
          const response = await axios({
            method: "post",
            url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
            data: { userId },
            params: {
              clientId: apiClientId,
              consumerKey: consumerKey,
              timestamp: timestamp,
              signature: signature,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "x-api-key": consumerKey,
              "Client-Id": apiClientId,
              Signature: signature,
              Timestamp: timestamp,
            },
          });

          results.push({
            format,
            success: response.status === 200 && !!response.data?.userSecret,
            status: response.status,
            hasUserSecret: !!response.data?.userSecret,
          });

          console.log(`Format ${format} result:`, {
            status: response.status,
            hasUserSecret: !!response.data?.userSecret,
          });

          if (response.status === 200 && response.data?.userSecret) {
            console.log(`SUCCESS! Format "${format}" works!`);

            // Set the working format as our default generator
            if (format === "docsFormat") {
              console.log(
                "Using the official documentation format for signatures"
              );
              // No need to change our implementation
            } else {
              console.log(
                `Updating signature generator to use format: ${format}`
              );
              // This implementation is intentionally not used; we're just logging what would change
            }

            // Return the first successful format and stop testing
            return res.status(200).json({
              results,
              workingFormat: format,
              signature: signature.substring(0, 10) + "...",
              userId,
              userSecret: response.data.userSecret,
            });
          }
        } catch (err) {
          const error = err as AxiosError;
          const status = error.response?.status;
          const errorMessage =
            error.response?.data && typeof error.response.data === "object"
              ? (error.response.data as any).detail
              : error.message;

          console.log(`Format ${format} failed:`, { status, errorMessage });
          results.push({
            format,
            success: false,
            status,
            error: errorMessage,
          });
        }
      }

      // If we got here, none of the formats worked
      console.log("No signature format worked successfully");
      return res.status(500).json({
        results,
        error: "No signature format worked successfully",
      });
    }

    // Regular registration logic continues below
    const { userId, clientId, forceRenew } = req.body;

    // Validate input
    if (!userId) {
      res.status(400).json({ error: "User ID is required" });
      return;
    }

    // Get SnapTrade API credentials
    const apiClientId = clientId || process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!apiClientId || !consumerKey) {
      res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // Log the registration attempt
    console.log(
      `Registering user with SnapTrade: ${userId.substring(
        0,
        8
      )}..., forceRenew: ${forceRenew}`
    );

    // Always try a fresh registration first without checking if user exists
    try {
      // Generate timestamp and signature for auth method 1
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateSignature(apiClientId, timestamp, consumerKey);

      console.log("Making registration request with authentication:", {
        hasTimestamp: !!timestamp,
        hasSignature: !!signature,
        hasClientId: !!apiClientId,
        hasConsumerKey: !!consumerKey,
        signatureLength: signature.length,
      });

      // Make direct request to SnapTrade API with clientId in query params
      const response = await axios({
        method: "post",
        url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
        data: { userId },
        params: {
          clientId: apiClientId,
          consumerKey: consumerKey,
          timestamp: timestamp,
          signature: signature,
        },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-api-key": consumerKey,
          "Client-Id": apiClientId,
          Signature: signature,
          Timestamp: timestamp,
          ClientId: apiClientId,
        },
      });

      // Check if we got a valid response
      if (
        response.status === 200 &&
        response.data &&
        response.data.userSecret
      ) {
        console.log("User registered successfully with SnapTrade");
        res.status(200).json({
          userId,
          userSecret: response.data.userSecret,
        });
        return;
      } else {
        console.error("Invalid response format from SnapTrade:", response.data);
        res.status(500).json({
          error: "Invalid response from SnapTrade API",
          data: response.data,
        });
        return;
      }
    } catch (error) {
      const apiError = error as AxiosError;

      // Special handling for 409 Conflict (user already exists)
      if (
        apiError.response?.status === 409 ||
        (apiError.response?.data &&
          typeof apiError.response.data === "object" &&
          apiError.response.data !== null &&
          "detail" in apiError.response.data &&
          typeof apiError.response.data.detail === "string" &&
          apiError.response.data.detail.includes("already exists"))
      ) {
        console.log(
          "User already exists in SnapTrade, attempting alternative registration approach"
        );

        // Try the alternative registration endpoint
        try {
          // Generate new timestamp and signature
          const newTimestamp = Math.floor(Date.now() / 1000).toString();
          const newSignature = generateSignature(
            apiClientId,
            newTimestamp,
            consumerKey
          );

          // Try the alternative login endpoint that might provide user credentials
          console.log("Attempting to get credentials via login endpoint");
          const loginResponse = await axios({
            method: "get",
            url: "https://api.snaptrade.com/api/v1/snapTrade/login",
            params: {
              userId,
              connectionType: "data",
              clientId: apiClientId,
              consumerKey: consumerKey,
              timestamp: newTimestamp,
              signature: newSignature,
            },
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "x-api-key": consumerKey,
              "Client-Id": apiClientId,
              Signature: newSignature,
              Timestamp: newTimestamp,
              ClientId: apiClientId,
            },
          });

          // Check if we can extract the user secret from the login response
          if (
            loginResponse.status === 200 &&
            loginResponse.data &&
            loginResponse.data.userSecret
          ) {
            console.log("Successfully obtained userSecret from login endpoint");
            res.status(200).json({
              userId,
              userSecret: loginResponse.data.userSecret,
            });
            return;
          } else {
            // If that doesn't work, try a direct new registration
            console.log(
              "Login endpoint did not provide userSecret, trying fresh registration"
            );

            // Try a new registration with a modified userId to avoid conflict
            const modifiedUserId = `${userId}-${Date.now()}`;
            const modifiedSignature = generateSignature(
              apiClientId,
              newTimestamp,
              consumerKey
            );

            const registerResponse = await axios({
              method: "post",
              url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
              data: { userId: modifiedUserId },
              params: {
                clientId: apiClientId,
                consumerKey: consumerKey,
                timestamp: newTimestamp,
                signature: modifiedSignature,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "x-api-key": consumerKey,
                "Client-Id": apiClientId,
                Signature: modifiedSignature,
                Timestamp: newTimestamp,
                ClientId: apiClientId,
              },
            });

            if (
              registerResponse.status === 200 &&
              registerResponse.data &&
              registerResponse.data.userSecret
            ) {
              console.log("Successfully registered with modified userId");
              res.status(200).json({
                userId: modifiedUserId, // Return the modified userId
                userSecret: registerResponse.data.userSecret,
              });
              return;
            } else {
              throw new Error("Failed to register with modified userId");
            }
          }
        } catch (fallbackError) {
          console.error(
            "All fallback registration attempts failed:",
            fallbackError
          );
          res.status(500).json({
            error: "Failed to register with SnapTrade",
            message:
              "Your account exists, but we couldn't establish a connection. Please try again later or contact support.",
          });
          return;
        }
      } else {
        // Log the specific error for debugging
        console.error(
          "Error registering user with SnapTrade:",
          apiError.response?.data || apiError.message,
          "Status:",
          apiError.response?.status
        );

        // Special handling for 401 Unauthorized errors
        if (apiError.response?.status === 401) {
          console.log(
            "Received 401 Unauthorized - this is likely an authentication issue"
          );

          // Try one more time with a different header format
          try {
            // Generate new timestamp for retry
            const retryTimestamp = Math.floor(Date.now() / 1000).toString();
            const retrySignature = generateSignature(
              apiClientId,
              retryTimestamp,
              consumerKey
            );

            const retryResponse = await axios({
              method: "post",
              url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
              data: { userId },
              params: {
                clientId: apiClientId,
                consumerKey: consumerKey,
                timestamp: retryTimestamp,
                signature: retrySignature,
              },
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-API-KEY": consumerKey,
                Signature: retrySignature,
                Timestamp: retryTimestamp,
              },
            });

            if (
              retryResponse.status === 200 &&
              retryResponse.data &&
              retryResponse.data.userSecret
            ) {
              console.log("Retry with alternative headers succeeded");
              res.status(200).json({
                userId,
                userSecret: retryResponse.data.userSecret,
              });
              return;
            }
          } catch (retryError) {
            console.error("Retry with alternative headers also failed");
          }
        }

        res.status(apiError.response?.status || 500).json({
          error: "Failed to register with SnapTrade",
          message:
            apiError.response?.data &&
            typeof apiError.response.data === "object" &&
            apiError.response.data !== null &&
            "detail" in apiError.response.data
              ? apiError.response.data.detail
              : apiError.message,
        });
        return;
      }
    }
  } catch (error) {
    // Catch-all for any other unexpected errors
    console.error("Unexpected error during SnapTrade registration:", error);
    res.status(500).json({
      error: "Internal server error during SnapTrade registration",
      message: "An unexpected error occurred. Please try again later.",
    });
    return;
  }
};

// Add the handler to the router
router.post("/", async (req: Request, res: Response) => {
  await registerHandler(req, res);
});

export default router;
