import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    // Validate userId
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "A valid userId string is required" });
    }

    // Access environment variables - try both formats
    const consumerKey = process.env.SNAPTRADE_CONSUMER_KEY || process.env.VITE_SNAPTRADE_CONSUMER_KEY;
    const clientId = process.env.SNAPTRADE_CLIENT_ID || process.env.VITE_SNAPTRADE_CLIENT_ID;

    // Log the environment variable status for debugging
    console.log('[API] SnapTrade registration environment:', {
      hasConsumerKey: !!consumerKey,
      hasClientId: !!clientId,
      nodeEnv: process.env.NODE_ENV,
      clientIdValue: clientId?.substring(0, 10) + '...'  // Partial logging for security
    });

    // Validate environment variables
    if (!consumerKey || !clientId) {
      return res.status(500).json({ 
        error: "Missing SnapTrade configuration",
        details: "Please ensure SNAPTRADE_CONSUMER_KEY and SNAPTRADE_CLIENT_ID are set in your environment"
      });
    }

    // Generate timestamp and signature for SnapTrade API
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create HMAC signature - using exact format that SnapTrade expects
    const signatureInput = `${clientId}${timestamp}`;
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(signatureInput)
      .digest("hex");

    console.log('[API] Generated authentication parameters:', {
      timestamp,
      signatureInputLength: signatureInput.length,
      signatureLength: signature.length
    });

    // Make the request to SnapTrade API with detailed logging
    try {
      console.log('[API] Sending registration request to SnapTrade API');
      
      const response = await axios({
        method: "post",
        url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
        data: { userId },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Signature: signature,
          Timestamp: timestamp,
          ClientId: clientId,
        },
        validateStatus: (status) => true, // Don't throw on any status
      });

      console.log("[API] SnapTrade registration response:", {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });

      if (response.status !== 200) {
        return res.status(response.status).json(response.data);
      }

      if (!response.data?.userSecret) {
        return res.status(500).json({
          error: "Invalid response from SnapTrade API",
          details: "No userSecret returned",
        });
      }

      // Return the successful response
      return res.status(200).json({
        userId,
        userSecret: response.data.userSecret,
      });
    } catch (apiError) {
      console.error('[API] SnapTrade API request failed:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("[API] Failed to register user:", error);
    
    // Improved error handling to provide more context
    let errorMessage = error instanceof Error ? error.message : String(error);
    let statusCode = 500;
    let errorData = {};
    
    // Handle axios errors
    if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorData = error.response.data;
      console.error('[API] Error response from SnapTrade:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    const errorResponse = {
      error: `Failed to register user: ${errorMessage}`,
      details: errorData,
      timestamp: new Date().toISOString()
    };
    
    console.error('[API] Error response:', errorResponse);
    return res.status(statusCode).json(errorResponse);
  }
}
