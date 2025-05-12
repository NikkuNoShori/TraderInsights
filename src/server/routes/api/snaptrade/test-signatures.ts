import { Router, RequestHandler } from "express";
import axios from "axios";
import crypto from "crypto";

const router = Router();

// Test different signature formats to figure out which one works with SnapTrade API
const testSignaturesHandler: RequestHandler = async (req, res, _next) => {
  try {
    // Use provided credentials or default to environment variables
    const { userId = "test-user-" + Date.now(), clientId } = req.body;

    const apiClientId = clientId || process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!apiClientId || !consumerKey) {
      res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set",
      });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Generate multiple signature formats to test
    const signatures = {
      // Test different signature formats
      original: crypto
        .createHmac("sha256", consumerKey)
        .update(`${apiClientId}${timestamp}`)
        .digest("hex"),
      withColon: crypto
        .createHmac("sha256", consumerKey)
        .update(`${userId}:${apiClientId}:${timestamp}`)
        .digest("hex"),
      clientIdOnly: crypto
        .createHmac("sha256", consumerKey)
        .update(apiClientId)
        .digest("hex"),
      userIdFirst: crypto
        .createHmac("sha256", consumerKey)
        .update(`${userId}${apiClientId}${timestamp}`)
        .digest("hex"),
      timestampFirst: crypto
        .createHmac("sha256", consumerKey)
        .update(`${timestamp}:${apiClientId}:${userId}`)
        .digest("hex"),
      withoutUserId: crypto
        .createHmac("sha256", consumerKey)
        .update(`${apiClientId}:${timestamp}`)
        .digest("hex"),
      consumerKeyIncluded: crypto
        .createHmac("sha256", consumerKey)
        .update(`${apiClientId}:${consumerKey}:${timestamp}`)
        .digest("hex"),
      docsExample: crypto
        .createHmac("sha256", consumerKey)
        .update(`${apiClientId}${timestamp}`)
        .digest("hex"),
    };

    // Run tests for each signature format in parallel
    const results = await Promise.allSettled(
      Object.entries(signatures).map(async ([format, signature]) => {
        try {
          console.log(`Testing signature format: ${format}`);

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

          if (
            response.status === 200 &&
            response.data &&
            response.data.userSecret
          ) {
            return {
              format,
              success: true,
              status: response.status,
              userSecret: response.data.userSecret.substring(0, 5) + "...",
            };
          } else {
            return {
              format,
              success: false,
              status: response.status,
              data: response.data,
            };
          }
        } catch (error: any) {
          return {
            format,
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data,
          };
        }
      })
    );

    // Process results to find which signature format worked
    const formattedResults = results.map((result, index) => {
      const format = Object.keys(signatures)[index];
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          format,
          success: false,
          error: "Promise rejected",
        };
      }
    });

    const successfulFormat = formattedResults.find((r) => r.success === true);

    res.status(200).json({
      results: formattedResults,
      workingFormat: successfulFormat ? successfulFormat.format : null,
      message: successfulFormat
        ? `Found working signature format: ${successfulFormat.format}`
        : "No signature format worked successfully",
    });
  } catch (error: any) {
    console.error("Error testing signature formats:", error);
    res.status(500).json({
      error: "Error testing signature formats",
      message: error.message,
    });
  }
};

router.post("/", testSignaturesHandler);

export default router;
