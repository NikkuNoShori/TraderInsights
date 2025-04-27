/**
 * SnapTrade Authentication Utilities
 * Centralizes authentication logic for SnapTrade API calls
 */

import { SnapTradeConfig, SnapTradeError, SnapTradeErrorCode } from "./types";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";

/**
 * Generates authentication headers for SnapTrade API requests
 * @param config - SnapTrade configuration
 * @param userId - User ID
 * @param userSecret - User secret
 * @returns Headers object with required authentication headers
 */
export function generateAuthHeaders(
  config: SnapTradeConfig,
  userId: string,
  userSecret: string
): Record<string, string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const messageToSign = `${timestamp}${userId}${userSecret}`;

    // Generate signature using HMAC SHA256
    const signature = HmacSHA256(messageToSign, config.consumerKey);
    const signatureBase64 = Base64.stringify(signature);

    return {
      Signature: signatureBase64,
      Timestamp: timestamp,
      ClientId: config.clientId,
      UserId: userId,
      UserSecret: userSecret,
      "Content-Type": "application/json",
    };
  } catch (error) {
    throw new SnapTradeError(
      "Failed to generate authentication headers",
      SnapTradeErrorCode.AUTHENTICATION_ERROR
    );
  }
}

/**
 * Validates authentication headers
 * @param headers - Authentication headers to validate
 * @throws SnapTradeError if headers are invalid
 */
export function validateAuthHeaders(headers: Record<string, string>): void {
  const requiredHeaders = [
    "Signature",
    "Timestamp",
    "ClientId",
    "UserId",
    "UserSecret",
  ];

  for (const header of requiredHeaders) {
    if (!headers[header]) {
      throw new SnapTradeError(
        `Missing required header: ${header}`,
        SnapTradeErrorCode.AUTHENTICATION_ERROR
      );
    }
  }
}

/**
 * Validates user credentials
 * @param userId - User ID to validate
 * @param userSecret - User secret to validate
 * @throws SnapTradeError if credentials are invalid
 */
export function validateUserCredentials(
  userId: string,
  userSecret: string
): void {
  if (!userId || !userSecret) {
    throw new SnapTradeError(
      "User credentials are required",
      SnapTradeErrorCode.AUTHENTICATION_ERROR
    );
  }

  if (userId.length < 3 || userId.length > 100) {
    throw new SnapTradeError(
      "User ID must be between 3 and 100 characters",
      SnapTradeErrorCode.AUTHENTICATION_ERROR
    );
  }

  if (userSecret.length < 32) {
    throw new SnapTradeError(
      "User secret must be at least 32 characters",
      SnapTradeErrorCode.AUTHENTICATION_ERROR
    );
  }
}

/**
 * Validates SnapTrade configuration
 * @param config - Configuration to validate
 * @throws SnapTradeError if configuration is invalid
 */
export function validateConfig(config: SnapTradeConfig): void {
  if (!config.clientId || !config.consumerKey) {
    throw new SnapTradeError(
      "Client ID and Consumer Key are required",
      SnapTradeErrorCode.CONFIGURATION_ERROR
    );
  }

  if (config.clientId.length < 32) {
    throw new SnapTradeError(
      "Client ID must be at least 32 characters",
      SnapTradeErrorCode.CONFIGURATION_ERROR
    );
  }

  if (config.consumerKey.length < 32) {
    throw new SnapTradeError(
      "Consumer Key must be at least 32 characters",
      SnapTradeErrorCode.CONFIGURATION_ERROR
    );
  }
}

/**
 * Maps SnapTrade API endpoints to our proxy routes
 */
const PROXY_ROUTE_MAP: Record<string, string> = {
  "/snapTrade/registerUser": "/api/snaptrade/register",
  "/snapTrade/login": "/api/snaptrade/login",
  "/referenceData/brokerages": "/api/snaptrade/brokerages",
  "/authorizations": "/api/snaptrade/authorizations",
  // Add more mappings as needed
};

/**
 * Get the API base URL based on environment
 */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser environment
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    // Remove trailing slash if present
    return baseUrl.replace(/\/$/, "");
  } else {
    // Server environment
    const baseUrl = process.env.VITE_API_BASE_URL || "http://localhost:3000";
    // Remove trailing slash if present
    return baseUrl.replace(/\/$/, "");
  }
}

/**
 * Make an authenticated request to SnapTrade API
 * @param config SnapTrade configuration
 * @param endpoint API endpoint
 * @param method HTTP method
 * @param body Request body
 * @returns Promise that resolves to response data
 */
export async function makeSnapTradeRequest<T>(
  config: SnapTradeConfig,
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<T> {
  try {
    // Determine if we're in a browser environment
    const isBrowser = typeof window !== "undefined";

    // Generate auth headers for both browser and server environments
    const headers = await generateAuthHeaders(config, "", "");

    // Always use proxy routes in browser environment to avoid CORS issues
    if (isBrowser) {
      // In browser: Use proxy routes to avoid CORS issues
      const proxyRoute =
        PROXY_ROUTE_MAP[endpoint] ||
        `/snaptrade/proxy?endpoint=${encodeURIComponent(endpoint)}`;
      const apiBaseUrl = getApiBaseUrl();

      // Ensure userSecret is included in the request body if it's a login request
      const requestBody =
        endpoint === "/snapTrade/login" && body?.userSecret
          ? { ...body, userSecret: body.userSecret }
          : body;

      console.log(`Making proxy API request to ${apiBaseUrl}${proxyRoute}`, {
        method,
        hasBody: !!requestBody,
        endpoint,
        hasUserSecret:
          endpoint === "/snapTrade/login" && !!requestBody?.userSecret,
        headerCount: Object.keys(headers).length,
      });

      // Make request through our proxy
      const response = await fetch(`${apiBaseUrl}${proxyRoute}`, {
        method,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: requestBody ? JSON.stringify(requestBody) : undefined,
      });

      // Handle errors
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error(`Proxy API error (${response.status}):`, errorData);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      // Parse and return response
      return await response.json();
    } else {
      // Server-side: Use direct API call with authentication headers
      console.log(`Making direct SnapTrade API request to ${endpoint}`, {
        method,
        hasBody: !!body,
        headerCount: Object.keys(headers).length,
      });

      // Make request
      const response = await fetch(
        `https://api.snaptrade.com/api/v1${endpoint}`,
        {
          method,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
        }
      );

      // Handle errors
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error(`SnapTrade API error (${response.status}):`, errorData);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      // Parse and return response
      return await response.json();
    }
  } catch (error) {
    console.error(`SnapTrade API request failed:`, error);
    throw error;
  }
}
