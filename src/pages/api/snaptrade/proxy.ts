import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";

/**
 * Unified SnapTrade API proxy handler
 * 
 * This endpoint proxies all SnapTrade API requests to avoid scattered API handlers.
 * Usage: Call /api/snaptrade/proxy?endpoint=/snapTrade/listUsers (or any other endpoint)
 * 
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the target endpoint from query params
    const { endpoint } = req.query;

    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({
        error: "Missing required 'endpoint' query parameter",
      });
    }

    // Access environment variables - try both formats
    const consumerKey =
      process.env.SNAPTRADE_CONSUMER_KEY ||
      process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    const clientId =
      process.env.SNAPTRADE_CLIENT_ID || process.env.VITE_SNAPTRADE_CLIENT_ID;

    // Validate environment variables
    if (!consumerKey || !clientId) {
      return res.status(500).json({
        error: "Missing SnapTrade configuration",
        details:
          "Please ensure SNAPTRADE_CONSUMER_KEY and SNAPTRADE_CLIENT_ID are set in your environment",
      });
    }

    // Generate timestamp and signature for SnapTrade API
    const timestamp = Math.floor(Date.now() / 1000).toString();

    // Create HMAC signature
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    // Parse the request body and query params
    const body = req.body;
    const queryParams = {...req.query};
    
    // Remove the endpoint from query params as it's not needed for the actual API
    delete queryParams.endpoint;
    
    // Add clientId and timestamp to query params if they don't exist
    if (!queryParams.clientId) {
      queryParams.clientId = clientId;
    }
    if (!queryParams.timestamp) {
      queryParams.timestamp = timestamp;
    }

    // Determine the correct authentication method based on the endpoint
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // Some endpoints use Signature/Timestamp/ClientId headers, others use x-api-key
    if (endpoint.includes("/snapTrade/listUsers")) {
      // List Users endpoint uses x-api-key
      headers["x-api-key"] = consumerKey;
    } else {
      // Most endpoints use Signature, Timestamp, and ClientId headers
      headers["Signature"] = signature;
      headers["Timestamp"] = timestamp;
      headers["ClientId"] = clientId;
    }

    // Special handling for specific endpoints
    let requestData = req.method !== "GET" ? body : undefined;
    let requestParams = req.method === "GET" ? queryParams : queryParams;

    // Handle special cases for particular endpoints
    if (endpoint.includes("/snapTrade/registerUser")) {
      console.log("Handling registerUser endpoint");
      
      // Ensure userId is properly formatted (no special characters or spaces)
      if (requestData && requestData.userId) {
        // Clean userId if needed (remove spaces, etc)
        if (typeof requestData.userId === 'string') {
          requestData.userId = requestData.userId.trim();
        }
      }
      
      // Registration typically requires only userId in the body
      if (requestData && !requestData.userId && body.userId) {
        requestData = { userId: body.userId };
      }
    } else if (endpoint.includes("/authorizations")) {
      console.log("Handling authorizations endpoint");
      // Authorizations endpoint needs userId and userSecret
      if (req.method === "GET") {
        // Ensure required params are in query params for GET
        if (body && body.userId && body.userSecret) {
          requestParams.userId = body.userId;
          requestParams.userSecret = body.userSecret;
        }
      } else {
        // Ensure required fields are in body for POST
        if (requestData && !requestData.userId && body.userId) {
          requestData = { 
            userId: body.userId,
            userSecret: body.userSecret
          };
        }
      }
    }

    // Prepare the URL for the SnapTrade API
    const apiUrl = `https://api.snaptrade.com/api/v1${endpoint}`;

    console.log(`Proxying ${req.method} request to ${apiUrl}`);
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Params:", JSON.stringify(requestParams, null, 2));
    
    if (requestData) {
      console.log("Body:", JSON.stringify(requestData, null, 2));
    }

    // Make the request to SnapTrade API
    const response = await axios({
      method: req.method?.toLowerCase() || "get",
      url: apiUrl,
      data: requestData,
      params: requestParams,
      headers: headers,
    });

    console.log(`Received response from SnapTrade: ${response.status}`);

    // Return the successful response
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy request failed:", error);

    // Handle errors from the SnapTrade API
    if (axios.isAxiosError(error) && error.response) {
      console.error("SnapTrade API error details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
      
      // Special handling for 400 errors - user already exists
      if (error.response.status === 400 && error.response.data) {
        const errorData = error.response.data;
        
        // Check if this is a "user already exists" error
        if (
          typeof errorData === 'object' && 
          errorData !== null && 
          'detail' in errorData &&
          typeof errorData.detail === 'string' &&
          (
            errorData.detail.includes('already exist') ||
            errorData.detail.includes('already registered')
          )
        ) {
          // Convert to a 409 Conflict to indicate the user exists but it's not a fatal error
          return res.status(409).json({
            status: 409,
            message: "User already exists in SnapTrade",
            detail: errorData.detail
          });
        }
      }
      
      // Return the original error from SnapTrade API
      return res.status(error.response.status).json({
        error: "SnapTrade API error",
        status: error.response.status,
        data: error.response.data,
      });
    }

    // Handle other errors
    return res.status(500).json({
      error: "Proxy request failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
