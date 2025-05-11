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

// Method 1: Using x-api-key header
async function testMethod1() {
  console.log("\n🔍 Testing Method 1: Using x-api-key header");
  try {
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
      headers: {
        "x-api-key": consumerKey,
        ClientId: clientId,
      },
    });

    console.log("✅ Success!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ Method 1 failed");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Method 2: Using signature with timestamp
async function testMethod2() {
  console.log("\n🔍 Testing Method 2: Using signature with timestamp");
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log(`Timestamp: ${timestamp}`);
    console.log(`Signature: ${maskValue(signature)}`);

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

    console.log("✅ Success!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ Method 2 failed");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Method 3: Using alternative signature format
async function testMethod3() {
  console.log("\n🔍 Testing Method 3: Using alternative signature format");
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureString = `${clientId}&${timestamp}`;
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(signatureString)
      .digest("hex");

    console.log(`Timestamp: ${timestamp}`);
    console.log(`Signature format: clientId&timestamp`);
    console.log(`Signature: ${maskValue(signature)}`);

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

    console.log("✅ Success!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ Method 3 failed");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Method 4: Using query parameter with x-api-key
async function testMethod4() {
  console.log("\n🔍 Testing Method 4: Using query parameter with x-api-key");
  try {
    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
      params: { clientId },
      headers: {
        "x-api-key": consumerKey,
      },
    });

    console.log("✅ Success!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ Method 4 failed");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Method 5: Using just x-api-key in URL
async function testMethod5() {
  console.log("\n🔍 Testing Method 5: Using just x-api-key in URL");
  try {
    const response = await axios({
      method: "get",
      url: `https://api.snaptrade.com/api/v1/snapTrade/listUsers?clientId=${encodeURIComponent(
        clientId
      )}`,
      headers: {
        "x-api-key": consumerKey,
      },
    });

    console.log("✅ Success!");
    console.log(`Found ${response.data.length} users`);
    return true;
  } catch (error: any) {
    console.error("❌ Method 5 failed");
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
  console.log("🧪 Testing SnapTrade listUsers API");

  let anySuccess = false;

  // Try all methods
  anySuccess = (await testMethod1()) || anySuccess;
  anySuccess = (await testMethod2()) || anySuccess;
  anySuccess = (await testMethod3()) || anySuccess;
  anySuccess = (await testMethod4()) || anySuccess;
  anySuccess = (await testMethod5()) || anySuccess;

  if (anySuccess) {
    console.log("\n✅ At least one method succeeded!");
  } else {
    console.error(
      "\n❌ All methods failed. Your credentials likely don't have permission to list users."
    );
    console.log(
      "\nThis likely means your SnapTrade account only has read-only permissions for public data."
    );
    console.log(
      "You may need to upgrade your account permissions with SnapTrade to enable user management operations."
    );
  }
}

// Run the tests
runTests().catch((error) => {
  console.error("Unhandled error during tests:", error);
  process.exit(1);
});
