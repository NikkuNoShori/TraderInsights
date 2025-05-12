import { Router, Request, Response, RequestHandler } from "express";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

const router = Router();

// Handle POST requests to /api/snaptrade/register
const registerHandler: RequestHandler = async (req, res, next) => {
  try {
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

    // Generate timestamp and signature for auth method 1
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${apiClientId}${timestamp}`)
      .digest("hex");

    // Make direct request to SnapTrade API
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
      data: { userId },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Include both authentication methods to ensure one works
        "x-api-key": consumerKey,
        "Client-Id": apiClientId,
        // Also include signature-based authentication as backup
        Signature: signature,
        Timestamp: timestamp,
        ClientId: apiClientId,
      },
    });

    // Check if we got a valid response
    if (response.status === 200 && response.data && response.data.userSecret) {
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
    // Handle error when user already exists
    if (
      (apiError.response &&
        apiError.response.status === 409 &&
        apiError.response.data &&
        typeof apiError.response.data === "object" &&
        apiError.response.data !== null &&
        "detail" in apiError.response.data &&
        typeof apiError.response.data.detail === "string" &&
        apiError.response.data.detail.includes("already exists")) ||
      req.body.forceRenew === true
    ) {
      console.log(
        "User already exists in SnapTrade, requesting new credentials",
        { forceRenew: !!req.body.forceRenew }
      );

      try {
        // Get variables for the request
        const userId = req.body.userId;
        const apiClientId =
          req.body.clientId || process.env.VITE_SNAPTRADE_CLIENT_ID;
        const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

        if (!apiClientId || !consumerKey) {
          throw new Error("Missing API credentials for re-registration");
        }

        // Generate new timestamp and signature
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = crypto
          .createHmac("sha256", consumerKey)
          .update(`${apiClientId}${timestamp}`)
          .digest("hex");

        // Try to delete the user first to ensure we get a fresh registration
        try {
          await axios({
            method: "delete",
            url: `https://api.snaptrade.com/api/v1/snapTrade/deleteUser`,
            data: { userId },
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
          console.log(`Deleted existing user: ${userId.substring(0, 8)}...`);
        } catch (error) {
          const deleteError = error as AxiosError;
          console.warn(
            "Could not delete user, proceeding with registration anyway:",
            deleteError.message
          );
        }

        // Generate new signature for registration
        const newTimestamp = Math.floor(Date.now() / 1000).toString();
        const newSignature = crypto
          .createHmac("sha256", consumerKey)
          .update(`${apiClientId}${newTimestamp}`)
          .digest("hex");

        // Re-register the user to get a fresh userSecret
        const response = await axios({
          method: "post",
          url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
          data: { userId },
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

        // Check if we got a valid response
        if (
          response.status === 200 &&
          response.data &&
          response.data.userSecret
        ) {
          console.log("User re-registered successfully with SnapTrade");
          res.status(200).json({
            userId,
            userSecret: response.data.userSecret,
          });
          return;
        } else {
          throw new Error(
            "Invalid response format from SnapTrade when re-registering"
          );
        }
      } catch (error) {
        const reregisterError = error as Error;
        console.error("Failed to re-register user:", reregisterError.message);
        res.status(500).json({
          error: "Failed to re-register with SnapTrade",
          message:
            "Your account exists but we couldn't get new credentials. Please try again.",
        });
        return;
      }
    }

    // Handle other errors
    console.error(
      "Error registering user with SnapTrade:",
      apiError.response?.data || apiError.message
    );

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
};

router.post("/", registerHandler);

export default router;
