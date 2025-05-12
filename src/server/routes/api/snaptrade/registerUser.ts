import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

// Handle POST requests to /api/snaptrade/register
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, clientId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get SnapTrade API credentials
    const apiClientId = clientId || process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!apiClientId || !consumerKey) {
      return res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
    }

    // Log the registration attempt
    console.log(
      `Registering user with SnapTrade: ${userId.substring(0, 8)}...`
    );

    // Make direct request to SnapTrade API
    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
      data: { userId },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": consumerKey,
        "Client-Id": apiClientId,
      },
    });

    // Check if we got a valid response
    if (response.status === 200 && response.data && response.data.userSecret) {
      return res.status(200).json({
        userId,
        userSecret: response.data.userSecret,
      });
    } else {
      console.error("Invalid response format from SnapTrade:", response.data);
      return res.status(500).json({
        error: "Invalid response from SnapTrade API",
        data: response.data,
      });
    }
  } catch (error: any) {
    // Handle error when user already exists
    if (
      error.response &&
      error.response.status === 409 &&
      error.response.data &&
      error.response.data.detail &&
      error.response.data.detail.includes("already exists")
    ) {
      console.log("User already exists in SnapTrade");
      return res.status(200).json({
        userId: req.body.userId,
        warning: "User already exists in SnapTrade",
      });
    }

    // Handle other errors
    console.error(
      "Error registering user with SnapTrade:",
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: "Failed to register with SnapTrade",
      message: error.response?.data?.detail || error.message,
    });
  }
});

export default router;
