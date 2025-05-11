import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

// Get environment variables with proper logging
const getEnvVar = (name: string, required = true): string => {
  // Try both formats (with and without VITE_ prefix)
  const value = process.env[name] || process.env[`VITE_${name}`] || "";

  if (required && !value) {
    console.error(`❌ ${name} is not set in your environment variables`);
    return "";
  }

  console.log(
    `✓ ${name} is ${value ? "set" : "NOT SET"} (${maskValue(value)})`
  );
  return value;
};

// Get required SnapTrade API credentials
const clientId = getEnvVar("SNAPTRADE_CLIENT_ID");
const consumerKey = getEnvVar("SNAPTRADE_CONSUMER_KEY");

if (!clientId || !consumerKey) {
  console.error("❌ Missing required SnapTrade API credentials");
  process.exit(1);
}

// Test connectivity to SnapTrade API with all auth methods
async function testSnapTradeConnection() {
  console.log(
    "\n🔍 Testing SnapTrade API connectivity with all auth methods..."
  );

  // Method 1: clientId+timestamp signature
  try {
    console.log("\n📝 Method 1: clientId+timestamp signature");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔑 Signature (clientId+timestamp): ${maskValue(signature)}`);

    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/brokerages",
      params: { clientId, timestamp },
      headers: {
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("✅ Method 1 succeeded!");
    console.log(`📊 Received ${response.data.length} brokerages in response`);
  } catch (error: any) {
    console.error("❌ Method 1 failed:");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
  }

  // Method 2: clientId&timestamp signature
  try {
    console.log("\n📝 Method 2: clientId&timestamp signature");
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}&${timestamp}`)
      .digest("hex");

    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔑 Signature (clientId&timestamp): ${maskValue(signature)}`);

    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/brokerages",
      params: { clientId, timestamp },
      headers: {
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("✅ Method 2 succeeded!");
    console.log(`📊 Received ${response.data.length} brokerages in response`);
  } catch (error: any) {
    console.error("❌ Method 2 failed:");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
  }

  // Method 3: x-api-key header
  try {
    console.log("\n📝 Method 3: x-api-key header");
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/brokerages",
      params: { clientId },
      headers: {
        Accept: "application/json",
        "x-api-key": consumerKey,
        ClientId: clientId,
      },
    });

    console.log("✅ Method 3 succeeded!");
    console.log(`📊 Received ${response.data.length} brokerages in response`);
  } catch (error: any) {
    console.error("❌ Method 3 failed:");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
  }
}

// Test user management endpoints
async function testUserManagement() {
  console.log("\n🔍 Testing SnapTrade user management endpoints...");

  // Try to list users with all methods
  // Method 1: x-api-key
  try {
    console.log("\n📝 Method 1: List users with x-api-key");
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
      headers: {
        "x-api-key": consumerKey,
        ClientId: clientId,
      },
    });

    console.log("✅ Method 1 succeeded!");
    console.log(`📊 Found ${response.data.length} users`);
  } catch (error: any) {
    console.error("❌ Method 1 failed:");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
  }

  // Method 2: Signature (clientId+timestamp)
  try {
    console.log(
      "\n📝 Method 2: List users with signature (clientId+timestamp)"
    );
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log(`📅 Timestamp: ${timestamp}`);
    console.log(`🔑 Signature (clientId+timestamp): ${maskValue(signature)}`);

    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
      params: { clientId, timestamp },
      headers: {
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("✅ Method 2 succeeded!");
    console.log(`📊 Found ${response.data.length} users`);
  } catch (error: any) {
    console.error("❌ Method 2 failed:");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
  }
}

// Main function
async function main() {
  console.log("🧪 SnapTrade API Verification Tool\n");
  console.log("Testing your SnapTrade API configuration and permissions...\n");

  // Test connectivity with all auth methods
  await testSnapTradeConnection();

  // Test user management endpoints
  await testUserManagement();

  console.log("\n🏁 Verification completed");
  console.log(
    "If any methods succeeded, you can use those in your implementation."
  );
  console.log(
    "If all auth methods failed for user endpoints but succeeded for brokerages,"
  );
  console.log(
    "you likely need to request read/write permissions from SnapTrade support."
  );
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
