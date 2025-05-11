import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk"; // You may need to install chalk: npm install chalk

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

// Server configuration
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const API_BASE_URL = `${SERVER_URL}/api/snaptrade`;

// Test user ID
const TEST_USER_ID = `test_user_${Date.now()}`;

// Define credential types
interface UserCredentials {
  userId: string;
  userSecret: string;
}

interface ApiUser {
  userId: string;
  [key: string]: any;
}

// Start validation
async function validateEndpoints() {
  console.log(chalk.blue("🔍 Validating SnapTrade server API endpoints\n"));

  let registrationSuccessful = false;
  let userCredentials: UserCredentials | null = null;

  // 1. Test registerUser endpoint
  console.log(chalk.cyan("🔹 Testing /api/snaptrade/registerUser endpoint"));
  try {
    const response = await axios.post(`${API_BASE_URL}/registerUser`, {
      userId: TEST_USER_ID,
    });

    console.log(chalk.green("✓ Registration successful"));
    console.log(`Response status: ${response.status}`);

    if (response.data.userId && response.data.userSecret) {
      userCredentials = {
        userId: response.data.userId,
        userSecret: response.data.userSecret,
      };

      console.log(`User ID: ${maskValue(response.data.userId)}`);
      console.log(`User Secret: ${maskValue(response.data.userSecret)}`);
      registrationSuccessful = true;
    } else if (
      response.data.warning &&
      response.data.warning.includes("already exists")
    ) {
      console.log(chalk.yellow("⚠️ User already exists in SnapTrade"));
      registrationSuccessful = true;

      // Try again with a different user ID
      const altTestUserId = `test_user_${Date.now() + 1}`;
      console.log(`Trying again with alternative user ID: ${altTestUserId}`);

      try {
        const altResponse = await axios.post(`${API_BASE_URL}/registerUser`, {
          userId: altTestUserId,
        });

        if (altResponse.data.userId && altResponse.data.userSecret) {
          userCredentials = {
            userId: altResponse.data.userId,
            userSecret: altResponse.data.userSecret,
          };

          console.log(chalk.green("✓ Alternative registration successful"));
          console.log(`User ID: ${maskValue(altResponse.data.userId)}`);
          console.log(`User Secret: ${maskValue(altResponse.data.userSecret)}`);
        }
      } catch (altError) {
        console.log(chalk.yellow("⚠️ Alternative registration also failed"));
      }
    }
  } catch (error) {
    console.error(chalk.red("✗ Registration failed"));
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error}`);
    }
  }

  // 2. Test login endpoint (if registration was successful)
  if (registrationSuccessful && userCredentials) {
    console.log(chalk.cyan("\n🔹 Testing /api/snaptrade/login endpoint"));
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        userId: userCredentials.userId,
        userSecret: userCredentials.userSecret,
      });

      console.log(chalk.green("✓ Login successful"));
      console.log(`Response status: ${response.status}`);

      const redirectUri =
        response.data.redirectUri || response.data.redirectURI;
      if (redirectUri) {
        console.log(`Redirect URI: ${redirectUri}`);
      } else {
        console.log(chalk.yellow("⚠️ No redirect URI in response"));
      }
    } catch (error) {
      console.error(chalk.red("✗ Login failed"));
      if (axios.isAxiosError(error) && error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`Error: ${error}`);
      }
    }
  } else {
    console.log(
      chalk.yellow(
        "\n⚠️ Skipping login test as registration was not successful"
      )
    );
  }

  // 3. Test listUsers endpoint
  console.log(chalk.cyan("\n🔹 Testing /api/snaptrade/listUsers endpoint"));
  try {
    const response = await axios.get(`${API_BASE_URL}/listUsers`);

    console.log(chalk.green("✓ List users successful"));
    console.log(`Response status: ${response.status}`);
    console.log(`Found ${response.data.length} users`);

    // Display first few users if available
    if (response.data.length > 0) {
      console.log(chalk.cyan("\nSample users:"));
      const users = response.data as ApiUser[];
      users.slice(0, 3).forEach((user, index) => {
        console.log(`User ${index + 1}: ID=${maskValue(user.userId)}`);
      });

      if (users.length > 3) {
        console.log(`...and ${users.length - 3} more users`);
      }
    }
  } catch (error) {
    console.error(chalk.red("✗ List users failed"));
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`Error: ${error}`);
    }
  }

  console.log(chalk.blue("\n🏁 Validation completed"));
}

// Run validation
validateEndpoints().catch((error) => {
  console.error(chalk.red("Unhandled error during validation:"), error);
  process.exit(1);
});
