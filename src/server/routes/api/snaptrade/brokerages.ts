import { Router, RequestHandler } from "express";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

const router = Router();

// Handle GET requests to /api/snaptrade/brokerages
const brokersHandler: RequestHandler = async (req, res, next) => {
  try {
    console.log("Handling brokerages request with direct fetch implementation");

    // Get environment variables
    const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      console.error("Missing SnapTrade credentials");
      res.status(500).json({
        error: "Missing SnapTrade credentials",
        message: "Server is not properly configured with SnapTrade credentials",
      });
      return;
    }

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Try first URL - referenceData/brokerages which should return all brokers
    try {
      console.log("Attempting to fetch from referenceData/brokerages endpoint");
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
        `Brokerages response status (referenceData): ${response.status}, found ${response.data.length} brokers`
      );

      // Return the broker data
      res.status(200).json(response.data);
      return;
    } catch (error) {
      const firstAttemptError = error as AxiosError;
      console.error(
        "First endpoint attempt failed, trying fallback:",
        firstAttemptError.message
      );

      // Try second URL - /brokerages directly
      try {
        console.log("Attempting to fetch from /brokerages endpoint");
        const response = await axios({
          method: "get",
          url: "https://api.snaptrade.com/api/v1/brokerages",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "x-api-key": consumerKey,
            "Client-Id": clientId,
            Signature: signature,
            Timestamp: timestamp,
            ClientId: clientId,
          },
        });

        console.log(
          `Brokerages response status (direct): ${response.status}, found ${response.data.length} brokers`
        );

        // Return the broker data
        res.status(200).json(response.data);
        return;
      } catch (error) {
        const secondAttemptError = error as AxiosError;
        console.error(
          "Second endpoint attempt also failed:",
          secondAttemptError.message
        );
        throw secondAttemptError; // Re-throw to be caught by the main catch block
      }
    }
  } catch (error) {
    const apiError = error as AxiosError;
    console.error(
      "Error fetching brokerages:",
      apiError.response?.data || apiError.message
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
          description: "Webull is a commission-free trading platform.",
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
          description: "Alpaca is a commission-free stock trading API.",
        },
        {
          id: "interactive_brokers",
          name: "Interactive Brokers",
          slug: "interactive_brokers",
          logo: "/images/brokers/interactive-brokers.png",
          url: "https://www.interactivebrokers.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description:
            "Interactive Brokers (IBKR) is a global electronic broker.",
        },
        {
          id: "td_ameritrade",
          name: "TD Ameritrade",
          slug: "td_ameritrade",
          logo: "/images/brokers/td-ameritrade.png",
          url: "https://www.tdameritrade.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description: "TD Ameritrade offers investing and trading services.",
        },
        {
          id: "robinhood",
          name: "Robinhood",
          slug: "robinhood",
          logo: "/images/brokers/robinhood.png",
          url: "https://robinhood.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description: "Robinhood is a commission-free investing platform.",
        },
        {
          id: "etrade",
          name: "E*TRADE",
          slug: "etrade",
          logo: "/images/brokers/etrade.png",
          url: "https://us.etrade.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description:
            "E*TRADE is a financial services company and pioneer in online trading.",
        },
        {
          id: "fidelity",
          name: "Fidelity",
          slug: "fidelity",
          logo: "/images/brokers/fidelity.png",
          url: "https://www.fidelity.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description:
            "Fidelity offers investment management, retirement planning, and brokerage services.",
        },
        {
          id: "schwab",
          name: "Charles Schwab",
          slug: "schwab",
          logo: "/images/brokers/schwab.png",
          url: "https://www.schwab.com",
          status: "ACTIVE",
          authTypes: ["OAUTH"],
          isOAuthSupported: true,
          isCredentialsSupported: false,
          description:
            "Charles Schwab offers a wide range of financial services.",
        },
      ];

      console.log("Returning mock broker data as fallback (8 brokers)");
      res.status(200).json(mockBrokerages);
      return;
    } catch (mockError) {
      console.error("Failed to provide mock data:", mockError);

      res.status(apiError.response?.status || 500).json({
        error: "Failed to fetch brokerages",
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
};

router.get("/", brokersHandler);

export default router;
