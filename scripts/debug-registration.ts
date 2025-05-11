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

async function testRegistration() {
  // Generate a test user ID
  const testUserId = `test_user_${Date.now()}`;
  console.log(
    `\n🧪 Testing SnapTrade user registration with user ID: ${testUserId}`
  );

  // STEP 1: Try with direct format (clientId + timestamp)
  try {
    console.log(
      "\n🔍 METHOD 1: Using standard signature format (clientId + timestamp)"
    );

    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Standard format: HMAC(clientId + timestamp)
    const signatureContent = `${clientId}${timestamp}`;
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(signatureContent)
      .digest("hex");

    console.log(`Timestamp: ${timestamp}`);
    console.log(`Signature content: "${signatureContent}"`);
    console.log(`Signature: ${maskValue(signature)}`);

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

    console.log("\n✅ SUCCESS! User registered successfully");
    console.log(`User ID: ${response.data.userId}`);
    console.log(`User Secret: ${maskValue(response.data.userSecret)}`);
    return true;
  } catch (error1: any) {
    console.error("\n❌ METHOD 1 failed");

    if (axios.isAxiosError(error1) && error1.response) {
      console.error(`Status: ${error1.response.status}`);
      console.error(`Error: ${JSON.stringify(error1.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error1.message || "Unknown error"}`);
    }

    // STEP 2: Try with alternative format (clientId & timestamp)
    try {
      console.log(
        "\n🔍 METHOD 2: Using alternative signature format (clientId & timestamp)"
      );

      const timestamp = Math.floor(Date.now() / 1000).toString();
      // Alternative format: HMAC(clientId + "&" + timestamp)
      const signatureContent = `${clientId}&${timestamp}`;
      const signature = crypto
        .createHmac("sha256", consumerKey)
        .update(signatureContent)
        .digest("hex");

      console.log(`Timestamp: ${timestamp}`);
      console.log(`Signature content: "${signatureContent}"`);
      console.log(`Signature: ${maskValue(signature)}`);

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

      console.log("\n✅ SUCCESS! User registered successfully with Method 2");
      console.log(`User ID: ${response.data.userId}`);
      console.log(`User Secret: ${maskValue(response.data.userSecret)}`);
      return true;
    } catch (error2: any) {
      console.error("\n❌ METHOD 2 failed");

      if (axios.isAxiosError(error2) && error2.response) {
        console.error(`Status: ${error2.response.status}`);
        console.error(
          `Error: ${JSON.stringify(error2.response.data, null, 2)}`
        );
      } else {
        console.error(`Error: ${error2.message || "Unknown error"}`);
      }

      // STEP 3: Try with JSON content signing method
      try {
        console.log("\n🔍 METHOD 3: Using JSON content signing method");

        const timestamp = Math.floor(Date.now() / 1000).toString();

        // JSON content format (from official docs)
        const signatureObject = {
          content: { userId: testUserId },
          path: "/api/v1/snapTrade/registerUser",
          query: `clientId=${clientId}&timestamp=${timestamp}`,
        };

        const signatureContent = JSON.stringify(signatureObject, null, 0);
        console.log(`Signature content: ${signatureContent}`);

        const signature = crypto
          .createHmac("sha256", consumerKey)
          .update(signatureContent)
          .digest("base64"); // Using base64 for this method

        console.log(`Timestamp: ${timestamp}`);
        console.log(`Signature (base64): ${maskValue(signature)}`);

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

        console.log("\n✅ SUCCESS! User registered successfully with Method 3");
        console.log(`User ID: ${response.data.userId}`);
        console.log(`User Secret: ${maskValue(response.data.userSecret)}`);
        return true;
      } catch (error3: any) {
        console.error("\n❌ METHOD 3 failed");

        if (axios.isAxiosError(error3) && error3.response) {
          console.error(`Status: ${error3.response.status}`);
          console.error(
            `Error: ${JSON.stringify(error3.response.data, null, 2)}`
          );
        } else {
          console.error(`Error: ${error3.message || "Unknown error"}`);
        }

        // All methods failed, show detailed diagnostic
        console.error("\n❌ All signature methods failed");
        console.log("\n📝 DETAILED DIAGNOSTICS:");
        console.log(
          `clientId: ${maskValue(clientId)} (length: ${clientId.length})`
        );
        console.log(
          `consumerKey: ${maskValue(consumerKey)} (length: ${
            consumerKey.length
          })`
        );

        console.log("\nPossible issues:");
        console.log(
          "1. Your consumer key may be invalid or incorrectly formatted"
        );
        console.log(
          "2. Your client ID may be invalid or incorrectly formatted"
        );
        console.log(
          "3. Your SnapTrade account may still have read-only permissions"
        );
        console.log(
          "4. The SnapTrade API may be expecting a different signature format"
        );

        console.log(
          "\nRecommendation: Contact SnapTrade support with these error details"
        );
        return false;
      }
    }
  }
}

// Run the test
testRegistration().catch((error) => {
  console.error("Unhandled error during testing:", error);
  process.exit(1);
});
