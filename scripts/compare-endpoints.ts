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

// Get environment variables with proper logging - use VITE_ prefixed variables
const getEnvVar = (name: string, required = true): string => {
  const value = process.env[`VITE_${name}`] || "";

  if (required && !value) {
    console.error(`❌ VITE_${name} is not set in your environment variables`);
    return "";
  }

  console.log(
    `✓ VITE_${name} is ${value ? "set" : "NOT SET"} (${maskValue(value)})`
  );
  return value;
};

// Get required SnapTrade API credentials with VITE_ prefix
const clientId = getEnvVar("SNAPTRADE_CLIENT_ID");
const consumerKey = getEnvVar("SNAPTRADE_CONSUMER_KEY");

if (!clientId || !consumerKey) {
  console.error("❌ Missing required SnapTrade API credentials");
  process.exit(1);
}

// Test PUBLIC endpoint (brokerages list) - Should always work
async function testPublicEndpoint() {
  console.log("\n🔍 Testing PUBLIC endpoint: List brokerages");
  try {
    // Generate signature and timestamp for API request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

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

    console.log("✅ PUBLIC endpoint SUCCESS!");
    console.log(`Received ${response.data.length} brokerages`);
    return true;
  } catch (error: any) {
    console.error("❌ PUBLIC endpoint FAILED");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Test USER REGISTRATION endpoint - Requires additional permissions
async function testUserRegistrationEndpoint() {
  console.log("\n🔍 Testing USER REGISTRATION endpoint");

  // Generate a test user ID
  const testUserId = `test_user_${Date.now()}`;

  try {
    // Generate signature and timestamp for API request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    const response = await axios({
      method: "post",
      url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
      data: { userId: testUserId },
      params: { clientId, timestamp },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("✅ USER REGISTRATION endpoint SUCCESS!");
    console.log(`Registered user: ${response.data.userId}`);
    return true;
  } catch (error: any) {
    console.error("❌ USER REGISTRATION endpoint FAILED");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Test USER LISTING endpoint - Requires additional permissions
async function testUserListingEndpoint() {
  console.log("\n🔍 Testing USER LISTING endpoint");
  try {
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
      headers: {
        "x-api-key": consumerKey,
        ClientId: clientId,
      },
    });

    console.log("✅ USER LISTING endpoint SUCCESS!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ USER LISTING endpoint FAILED");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

async function runTests() {
  console.log("🧪 Comparing SnapTrade API Access Levels\n");

  // Test public endpoints first
  const publicSuccess = await testPublicEndpoint();

  // Test user management endpoints
  const registrationSuccess = await testUserRegistrationEndpoint();
  const listingSuccess = await testUserListingEndpoint();

  console.log("\n📊 RESULTS SUMMARY:");
  console.log(
    `Public endpoint (brokerages): ${
      publicSuccess ? "✅ SUCCESS" : "❌ FAILED"
    }`
  );
  console.log(
    `User registration endpoint: ${
      registrationSuccess ? "✅ SUCCESS" : "❌ FAILED"
    }`
  );
  console.log(
    `User listing endpoint: ${listingSuccess ? "✅ SUCCESS" : "❌ FAILED"}`
  );

  // Analyze the results
  if (publicSuccess && !registrationSuccess && !listingSuccess) {
    console.log(
      "\n🔒 DIAGNOSIS: Your SnapTrade account appears to have READ-ONLY permissions"
    );
    console.log(
      "Your account can access public data like brokerages list, but cannot perform user management operations."
    );
    console.log(
      "\n🔑 SOLUTION: Contact SnapTrade to upgrade your account permissions to enable user registration and management."
    );
    console.log(
      "Explain that you're receiving 401/403 errors when trying to register or list users, but can successfully list brokerages."
    );
  } else if (!publicSuccess) {
    console.log(
      "\n🔒 DIAGNOSIS: Your SnapTrade credentials appear to be invalid or misconfigured"
    );
    console.log(
      "Your account cannot access even public endpoints, which suggests a credential problem."
    );
    console.log(
      "\n🔑 SOLUTION: Double-check your clientId and consumerKey for accuracy. If they're correct, contact SnapTrade for support."
    );
  } else {
    console.log(
      "\n🔒 DIAGNOSIS: Your SnapTrade integration has mixed permission issues"
    );
    console.log(
      "Some endpoints work while others don't, which suggests a specific permission configuration."
    );
    console.log(
      "\n🔑 SOLUTION: Contact SnapTrade with these test results to identify the specific permission issue."
    );
  }
}

// Run the tests
runTests().catch((error) => {
  console.error("Unhandled error during tests:", error);
  process.exit(1);
});
