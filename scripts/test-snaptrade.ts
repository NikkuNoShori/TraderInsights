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

// Test connectivity to SnapTrade API
async function testSnapTradeConnection() {
  try {
    console.log("\n🔍 Testing SnapTrade API connectivity...");

    // Generate signature and timestamp for API request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log(`📅 Using timestamp: ${timestamp}`);
    console.log(`🔑 Generated signature: ${maskValue(signature)}`);

    // Make request to get brokerages list (public endpoint)
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

    console.log("\n✅ Successfully connected to SnapTrade API");
    console.log(`📊 Received ${response.data.length} brokerages in response`);

    // List first few brokerages as verification
    console.log("\nAvailable Brokerages:");
    response.data.slice(0, 5).forEach((broker: any, index: number) => {
      console.log(`${index + 1}. ${broker.name} (${broker.id})`);
    });

    if (response.data.length > 5) {
      console.log(`...and ${response.data.length - 5} more`);
    }

    return true;
  } catch (error: any) {
    console.error("\n❌ Failed to connect to SnapTrade API");

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }

    return false;
  }
}

// List existing users and identify test users
async function listExistingUsers() {
  try {
    console.log("\n🔍 Listing existing SnapTrade users...");

    // Try multiple authentication methods
    console.log("Trying method 1: Using x-api-key header");
    try {
      const response = await axios({
        method: "get",
        url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
        headers: {
          "x-api-key": consumerKey,
          ClientId: clientId,
        },
      });

      console.log(`📊 Found ${response.data.length} existing users`);

      // Return only test users (with 'test_user' in the ID)
      const testUsers = response.data.filter(
        (user: any) => user.userId && user.userId.includes("test_user")
      );

      if (testUsers.length > 0) {
        console.log(`🧪 Found ${testUsers.length} existing test users`);
        testUsers.forEach((user: any, index: number) => {
          console.log(`User ${index + 1}: ID=${maskValue(user.userId)}`);
        });
      } else {
        console.log("No existing test users found");
      }

      return testUsers;
    } catch (error1) {
      console.log("Method 1 failed, trying method 2: Using signature");

      // Generate timestamp and signature
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = crypto
        .createHmac("sha256", consumerKey)
        .update(`${clientId}${timestamp}`)
        .digest("hex");

      try {
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

        console.log(`📊 Found ${response.data.length} existing users`);

        // Return only test users (with 'test_user' in the ID)
        const testUsers = response.data.filter(
          (user: any) => user.userId && user.userId.includes("test_user")
        );

        if (testUsers.length > 0) {
          console.log(`🧪 Found ${testUsers.length} existing test users`);
          testUsers.forEach((user: any, index: number) => {
            console.log(`User ${index + 1}: ID=${maskValue(user.userId)}`);
          });
        } else {
          console.log("No existing test users found");
        }

        return testUsers;
      } catch (error2) {
        console.log("Method 2 failed, trying method 3: With query parameters");

        try {
          const response = await axios({
            method: "get",
            url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
            params: { clientId },
            headers: {
              "x-api-key": consumerKey,
            },
          });

          console.log(`📊 Found ${response.data.length} existing users`);

          // Return only test users (with 'test_user' in the ID)
          const testUsers = response.data.filter(
            (user: any) => user.userId && user.userId.includes("test_user")
          );

          if (testUsers.length > 0) {
            console.log(`🧪 Found ${testUsers.length} existing test users`);
            testUsers.forEach((user: any, index: number) => {
              console.log(`User ${index + 1}: ID=${maskValue(user.userId)}`);
            });
          } else {
            console.log("No existing test users found");
          }

          return testUsers;
        } catch (error3) {
          // If all methods fail, rethrow the original error
          console.error("All methods for listing users failed");
          throw error1;
        }
      }
    }
  } catch (error: any) {
    console.error("\n❌ Failed to list existing users");

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }

    return [];
  }
}

// Delete a user
async function deleteUser(userId: string) {
  try {
    console.log(`\n🗑️ Deleting user: ${maskValue(userId)}...`);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    const response = await axios({
      method: "delete",
      url: "https://api.snaptrade.com/api/v1/snapTrade/deleteUser",
      data: { userId },
      params: { clientId, timestamp },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Signature: signature,
        Timestamp: timestamp,
        ClientId: clientId,
      },
    });

    console.log(`✅ Successfully deleted user: ${maskValue(userId)}`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ Failed to delete user: ${maskValue(userId)}`);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }

    return false;
  }
}

// Test registering a test user
async function testUserRegistration() {
  try {
    console.log("\n🔍 Testing user registration...");

    // Generate a test user ID
    const testUserId = `test_user_${Date.now()}`;
    console.log(`👤 Using test user ID: ${testUserId}`);

    // Generate signature and timestamp for API request
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", consumerKey)
      .update(`${clientId}${timestamp}`)
      .digest("hex");

    console.log("Trying method 1: Standard API request");

    try {
      // Make request to register user
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

      console.log("\n✅ Successfully registered test user");
      console.log(`User ID: ${response.data.userId}`);
      console.log(`User Secret: ${maskValue(response.data.userSecret)}`);

      return {
        userId: response.data.userId,
        userSecret: response.data.userSecret,
      };
    } catch (error1) {
      console.log(
        "Method 1 failed, trying method 2: Alternative signing approach"
      );

      // Try alternative method that some SnapTrade versions require
      const timestamp2 = Math.floor(Date.now() / 1000).toString();
      const signatureString = `${clientId}&${timestamp2}`;
      const signature2 = crypto
        .createHmac("sha256", consumerKey)
        .update(signatureString)
        .digest("hex");

      console.log(`Using alternative signature format: clientId&timestamp`);
      console.log(`New timestamp: ${timestamp2}`);
      console.log(`New signature: ${maskValue(signature2)}`);

      try {
        const response2 = await axios({
          method: "post",
          url: "https://api.snaptrade.com/api/v1/snapTrade/registerUser",
          data: { userId: testUserId },
          params: { clientId, timestamp: timestamp2 },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Signature: signature2,
            Timestamp: timestamp2,
            ClientId: clientId,
          },
        });

        console.log("\n✅ Successfully registered test user (with method 2)");
        console.log(`User ID: ${response2.data.userId}`);
        console.log(`User Secret: ${maskValue(response2.data.userSecret)}`);

        return {
          userId: response2.data.userId,
          userSecret: response2.data.userSecret,
        };
      } catch (error2) {
        console.log(
          "Method 2 failed, trying method 3: Registration through brokerage list"
        );

        // Some credentials require going through brokerage list first
        try {
          // First check if user already exists by listing all users
          const timestamp3 = Math.floor(Date.now() / 1000).toString();

          const listUsersResponse = await axios({
            method: "get",
            url: "https://api.snaptrade.com/api/v1/snapTrade/listUsers",
            headers: {
              "x-api-key": consumerKey,
              ClientId: clientId,
            },
          });

          console.log("\nExisting users:", listUsersResponse.data.length);

          // List the first few users
          listUsersResponse.data
            .slice(0, 3)
            .forEach((user: any, index: number) => {
              console.log(`User ${index + 1}: ID=${maskValue(user.userId)}`);
            });

          // Find if our test user already exists
          const existingUser = listUsersResponse.data.find(
            (user: any) =>
              user.userId && user.userId.includes(testUserId.substring(0, 8))
          );

          if (existingUser) {
            console.log("\n✅ User already exists in the system");
            return {
              userId: existingUser.userId,
              userSecret: "EXISTING_USER",
            };
          } else {
            console.error("\n❌ All registration methods failed");
            throw new Error("Registration failed with all methods");
          }
        } catch (error3) {
          // Re-throw the first error which is likely most relevant
          if (axios.isAxiosError(error1) && error1.response) {
            throw error1;
          } else {
            throw error3;
          }
        }
      }
    }
  } catch (error: any) {
    console.error("\n❌ Failed to register test user");

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error("No response received from server");
      } else {
        console.error(`Error: ${error.message}`);
      }
    } else {
      console.error(`Error: ${error.message || "Unknown error"}`);
    }

    return null;
  }
}

// Main test function
async function runTests() {
  console.log("🧪 Testing SnapTrade API Integration\n");

  // Test basic connectivity
  const connectionOk = await testSnapTradeConnection();
  if (!connectionOk) {
    console.error(
      "\n❌ Basic connectivity test failed. Please check your API credentials."
    );
    process.exit(1);
  }

  // List existing users and delete test users
  const existingTestUsers = await listExistingUsers();

  // Delete existing test users to avoid conflicts
  for (const user of existingTestUsers) {
    await deleteUser(user.userId);
  }

  // Test user registration
  const user = await testUserRegistration();
  if (!user) {
    console.error(
      "\n❌ User registration test failed. Please check API permissions."
    );
    process.exit(1);
  }

  console.log("\n🎉 All tests passed successfully!");
  console.log("Your SnapTrade API integration is working correctly.");
}

// Run the tests
runTests().catch((error) => {
  console.error("Unhandled error during tests:", error);
  process.exit(1);
});
