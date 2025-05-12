import { Request, Response, NextFunction, RequestHandler } from "express";
import axios, { AxiosError } from "axios";
import crypto from "crypto";

/**
 * Handle SnapTrade API proxy requests
 * This allows us to securely make SnapTrade API calls while keeping credentials on the server
 */
export const handleSnapTradeProxy: RequestHandler = async (req, res, _next) => {
  try {
    // Get the API endpoint from query parameters
    const endpoint = req.query.endpoint as string;

    if (!endpoint) {
      res.status(400).json({
        error: "Missing endpoint parameter",
        message: "endpoint query parameter is required",
      });
      return;
    }

    // Extract parameters
    const userId = req.body.userId || req.query.userId;
    const userSecret = req.body.userSecret || req.query.userSecret;

    // Get API credentials
    const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID;
    const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY;

    if (!clientId || !consumerKey) {
      res.status(500).json({
        error: "Missing SnapTrade API credentials",
        message:
          "Please ensure VITE_SNAPTRADE_CLIENT_ID and VITE_SNAPTRADE_CONSUMER_KEY are set in your environment",
      });
      return;
    }

    // Generate timestamp and signature for auth
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Prepare request URL and options
    const baseUrl = "https://api.snaptrade.com/api/v1";
    const targetUrl = `${baseUrl}${endpoint}`;

    // Prepare request configuration
    const options = {
      method: req.method,
      url: targetUrl,
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
      data: req.body,
      params: { ...req.query },
    };

    // Remove endpoint from params as it's not a real SnapTrade param
    delete options.params.endpoint;

    // Add user credentials to params if provided
    if (userId) {
      options.params.userId = userId;
    }

    if (userSecret) {
      options.params.userSecret = userSecret;
    }

    // Log proxied request (safely)
    console.log("Proxying SnapTrade request:", {
      method: options.method,
      url: targetUrl,
      hasBody: !!options.data && Object.keys(options.data).length > 0,
      hasParams: !!options.params && Object.keys(options.params).length > 0,
      paramsKeys: options.params ? Object.keys(options.params) : [],
      hasUserId: !!userId,
      hasUserSecret: !!userSecret,
    });

    // Make the API request
    const response = await axios(options);

    // Return the API response
    res.status(response.status).json(response.data);
    return;
  } catch (error) {
    const apiError = error as AxiosError;
    console.error(
      "SnapTrade proxy error:",
      apiError.response?.data || apiError.message
    );

    // Return error information
    res.status(apiError.response?.status || 500).json({
      error: "SnapTrade API error",
      status: apiError.response?.status,
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
