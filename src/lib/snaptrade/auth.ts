/**
 * SnapTrade Authentication Utilities
 * Centralizes authentication logic for SnapTrade API calls
 */

import { SnapTradeConfig } from "./types";

/**
 * Generate a signature for SnapTrade API authentication
 * @param clientId The SnapTrade client ID
 * @param consumerKey The SnapTrade consumer key
 * @param timestamp Unix timestamp
 * @returns Promise that resolves to the signature
 */
export async function generateSignature(
  clientId: string,
  consumerKey: string,
  timestamp: string
): Promise<string> {
  try {
    // Message to sign is clientId + timestamp
    const message = `${clientId}${timestamp}`;

    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.subtle
    ) {
      // Browser environment: Use Web Crypto API
      const encoder = new TextEncoder();
      const key = encoder.encode(consumerKey);
      const messageBuffer = encoder.encode(message);

      // Import key for HMAC
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      // Sign the message
      const signatureBuffer = await window.crypto.subtle.sign(
        "HMAC",
        cryptoKey,
        messageBuffer
      );

      // Convert to hex string
      return Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } else {
      // Node.js environment: Use crypto
      const crypto = require("crypto");
      return crypto
        .createHmac("sha256", consumerKey)
        .update(message)
        .digest("hex");
    }
  } catch (error) {
    console.error("Failed to generate signature:", error);
    throw new Error(
      `Signature generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Generate authentication headers for SnapTrade API
 * @param config SnapTrade configuration
 * @returns Promise that resolves to headers object
 */
export async function generateAuthHeaders(
  config: SnapTradeConfig
): Promise<Record<string, string>> {
  if (!config.clientId || !config.consumerKey) {
    throw new Error("Missing required SnapTrade configuration");
  }

  // Generate timestamp
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Generate signature
  const signature = await generateSignature(
    config.clientId,
    config.consumerKey,
    timestamp
  );

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Signature: signature,
    Timestamp: timestamp,
    ClientId: config.clientId,
  };
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
    // Generate auth headers
    const headers = await generateAuthHeaders(config);

    // Log request details (without sensitive info)
    console.log(`Making SnapTrade API request to ${endpoint}`, {
      method,
      hasBody: !!body,
      clientId: config.clientId,
      headerCount: Object.keys(headers).length,
    });

    // Make request
    const response = await fetch(
      `https://api.snaptrade.com/api/v1${endpoint}`,
      {
        method,
        headers,
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
  } catch (error) {
    console.error(`SnapTrade API request failed:`, error);
    throw error;
  }
}
