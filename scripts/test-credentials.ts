import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// Load environment variables
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

// Helper to mask sensitive data for logging
const maskValue = (value: string): string => {
  if (!value) return "NOT_SET";
  if (value.length <= 6) return "***";
  return `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
};

// Function to get client ID and consumer key
const getCredentials = () => {
  // Get from both formats (with and without VITE_ prefix)
  const clientId =
    process.env.SNAPTRADE_CLIENT_ID ||
    process.env.VITE_SNAPTRADE_CLIENT_ID ||
    "";
  const consumerKey =
    process.env.SNAPTRADE_CONSUMER_KEY ||
    process.env.VITE_SNAPTRADE_CONSUMER_KEY ||
    "";

  return { clientId, consumerKey };
};

// Sanitize keys - remove any whitespace that might be present
const sanitizeKeys = (keys: { clientId: string; consumerKey: string }) => {
  return {
    clientId: keys.clientId.trim(),
    consumerKey: keys.consumerKey.trim(),
  };
};

// Test signature generation with multiple formats
const testSignatureGeneration = (keys: {
  clientId: string;
  consumerKey: string;
}) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Method 1: clientId + timestamp
  const signature1 = crypto
    .createHmac("sha256", keys.consumerKey)
    .update(`${keys.clientId}${timestamp}`)
    .digest("hex");

  // Method 2: clientId & timestamp
  const signature2 = crypto
    .createHmac("sha256", keys.consumerKey)
    .update(`${keys.clientId}&${timestamp}`)
    .digest("hex");

  // Method 3: reversed order - timestamp + clientId
  const signature3 = crypto
    .createHmac("sha256", keys.consumerKey)
    .update(`${timestamp}${keys.clientId}`)
    .digest("hex");

  return { timestamp, signature1, signature2, signature3 };
};

// Main function
const main = async () => {
  console.log("🔍 Testing SnapTrade Credentials Format\n");

  // Get credentials
  let credentials = getCredentials();

  console.log("Original credentials:");
  console.log(
    `clientId: ${maskValue(credentials.clientId)} (length: ${
      credentials.clientId.length
    })`
  );
  console.log(
    `consumerKey: ${maskValue(credentials.consumerKey)} (length: ${
      credentials.consumerKey.length
    })`
  );

  // Check for whitespace issues
  const hasWhitespace = {
    clientId: credentials.clientId !== credentials.clientId.trim(),
    consumerKey: credentials.consumerKey !== credentials.consumerKey.trim(),
  };

  if (hasWhitespace.clientId || hasWhitespace.consumerKey) {
    console.log("\n⚠️ Found whitespace in credentials - sanitizing");
    credentials = sanitizeKeys(credentials);
    console.log(
      `Sanitized clientId: ${maskValue(credentials.clientId)} (length: ${
        credentials.clientId.length
      })`
    );
    console.log(
      `Sanitized consumerKey: ${maskValue(credentials.consumerKey)} (length: ${
        credentials.consumerKey.length
      })`
    );
  }

  // Test signature generation
  console.log("\n🔐 Testing signature generation");
  const { timestamp, signature1, signature2, signature3 } =
    testSignatureGeneration(credentials);

  console.log(`Timestamp: ${timestamp}`);
  console.log(`Method 1 (clientId+timestamp): ${maskValue(signature1)}`);
  console.log(`Method 2 (clientId&timestamp): ${maskValue(signature2)}`);
  console.log(`Method 3 (timestamp+clientId): ${maskValue(signature3)}`);

  // Check for proper environment variable prefixes
  const hasVitePrefix =
    !!process.env.VITE_SNAPTRADE_CLIENT_ID &&
    !!process.env.VITE_SNAPTRADE_CONSUMER_KEY;
  const hasNonVitePrefix =
    !!process.env.SNAPTRADE_CLIENT_ID && !!process.env.SNAPTRADE_CONSUMER_KEY;

  console.log("\n📋 Environment variable check:");
  console.log(
    `VITE_ prefixed variables present: ${hasVitePrefix ? "✅" : "❌"}`
  );
  console.log(`Non-VITE_ variables present: ${hasNonVitePrefix ? "✅" : "❌"}`);

  // Recommendations
  console.log("\n🔧 Recommendations:");

  if (!credentials.clientId || !credentials.consumerKey) {
    console.log(
      "❌ Missing credentials - Please ensure both clientId and consumerKey are set"
    );
  } else if (hasWhitespace.clientId || hasWhitespace.consumerKey) {
    console.log("⚠️ Remove whitespace from your environment variables");
    console.log(
      `Update your .env file to remove any spaces from the credentials`
    );
  } else {
    console.log("✅ Credentials are properly formatted");
  }

  if (!hasVitePrefix) {
    console.log("⚠️ Add VITE_ prefixed variables for browser components:");
    console.log("VITE_SNAPTRADE_CLIENT_ID=your-client-id");
    console.log("VITE_SNAPTRADE_CONSUMER_KEY=your-consumer-key");
  }

  if (!hasNonVitePrefix) {
    console.log("⚠️ Add non-prefixed variables for server components:");
    console.log("SNAPTRADE_CLIENT_ID=your-client-id");
    console.log("SNAPTRADE_CONSUMER_KEY=your-consumer-key");
  }

  console.log("\n📝 Verify with SnapTrade:");
  console.log(
    "1. Ensure you're using the correct credentials from your SnapTrade dashboard"
  );
  console.log(
    "2. Confirm you have READ/WRITE permissions enabled for user management"
  );
  console.log(
    "3. Check if your account requires a special signature format - contact SnapTrade support if in doubt"
  );
};

// Run the main function
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
