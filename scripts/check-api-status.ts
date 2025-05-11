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

async function checkApiStatus() {
  console.log("\n🔍 Checking SnapTrade API Status");
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    const response = await axios({
      method: "get",
      url: "https://api.snaptrade.com/api/v1/snapTrade/apiStatus",
      params: { clientId, timestamp },
      headers: {
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log("✅ API Status Check SUCCESS!");
    console.log(JSON.stringify(response.data, null, 2));

    return true;
  } catch (error: any) {
    console.error("❌ API Status Check FAILED");
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }
    return false;
  }
}

// Check API status
checkApiStatus().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
