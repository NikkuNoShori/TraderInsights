import { Router, Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";

const router = Router();

// Handle GET requests to /api/snaptrade/brokerages
router.get("/", async (req: Request, res: Response) => {
  console.log("Handling brokerages request with direct fetch implementation");

  try {
    // Get environment variables
    const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      console.error("Missing SnapTrade credentials");
      return res.status(500).json({
        error: "Missing SnapTrade credentials",
        message: "Server is not properly configured with SnapTrade credentials",
      });
    }

    // Generate timestamp and signature for auth method 1
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Make direct request to SnapTrade API
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/referenceData/brokerages",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        // Include both authentication methods to ensure one works
        "x-api-key": consumerKey,
        "Client-Id": clientId,
        // Also include signature-based authentication as backup
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log(
      `Brokerages response status: ${response.status}, found ${response.data.length} brokers`
    );

    // Return the broker data
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error(
      "Error fetching brokerages:",
      error.response?.data || error.message
    );

    // If API call fails, try to return mock data as fallback
    try {
      // Import mock data dynamically
      const mockBrokerages = [
        {
          id: "webull",
          name: "Webull",
          slug: "webull",
          logo: "/images/brokers/webull.png",
          url: "https://www.webull.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
        },
        {
          id: "alpaca",
          name: "Alpaca",
          slug: "alpaca",
          logo: "/images/brokers/alpaca.png",
          url: "https://alpaca.markets",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
        },
      ];

      console.log("Returning mock broker data as fallback");
      return res.status(200).json(mockBrokerages);
    } catch (mockError) {
      console.error("Failed to provide mock data:", mockError);

      return res.status(error.response?.status || 500).json({
        error: "Failed to fetch brokerages",
        message: error.response?.data?.detail || error.message,
      });
    }
  }
});

export default router;
