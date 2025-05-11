import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

// Helper to mask sensitive data for logging
const maskValue = (value: string): string => {
  if (!value || value.trim() === "") return "NOT_SET";
  if (value.length <= 6) return "***";
  return `${value.substring(0, 3)}...${value.substring(value.length - 3)}`;
};

// Check all possible environment variable names
console.log("🔍 Checking SnapTrade credentials in environment variables\n");

// Check direct environment variables
console.log("DIRECT ENVIRONMENT VARIABLES:");
console.log(
  `SNAPTRADE_CLIENT_ID: ${maskValue(process.env.SNAPTRADE_CLIENT_ID || "")}`
);
console.log(
  `SNAPTRADE_CONSUMER_KEY: ${maskValue(
    process.env.SNAPTRADE_CONSUMER_KEY || ""
  )}`
);

// Check VITE_ prefixed variables
console.log("\nVITE_ PREFIXED VARIABLES:");
console.log(
  `VITE_SNAPTRADE_CLIENT_ID: ${maskValue(
    process.env.VITE_SNAPTRADE_CLIENT_ID || ""
  )}`
);
console.log(
  `VITE_SNAPTRADE_CONSUMER_KEY: ${maskValue(
    process.env.VITE_SNAPTRADE_CONSUMER_KEY || ""
  )}`
);

// Which ones are actually being used in the code
console.log("\nVALUES USED BY CODE:");
const clientId = process.env.VITE_SNAPTRADE_CLIENT_ID || "";
const consumerKey = process.env.VITE_SNAPTRADE_CONSUMER_KEY || "";
console.log(
  `clientId being used: ${maskValue(clientId)} (length: ${clientId.length})`
);
console.log(
  `consumerKey being used: ${maskValue(consumerKey)} (length: ${
    consumerKey.length
  })`
);

// Check for formatting issues
console.log("\nFORMATTING CHECK:");
console.log(
  `clientId has whitespace: ${
    clientId.trim() !== clientId ? "YES - PROBLEM!" : "No"
  }`
);
console.log(
  `consumerKey has whitespace: ${
    consumerKey.trim() !== consumerKey ? "YES - PROBLEM!" : "No"
  }`
);

// Check for non-ASCII characters
function hasNonAsciiChars(str: string): boolean {
  return /[^\x00-\x7F]/.test(str);
}

console.log(
  `clientId has non-ASCII chars: ${
    hasNonAsciiChars(clientId) ? "YES - PROBLEM!" : "No"
  }`
);
console.log(
  `consumerKey has non-ASCII chars: ${
    hasNonAsciiChars(consumerKey) ? "YES - PROBLEM!" : "No"
  }`
);

// Show exact length and positions for debugging
console.log("\nDETAILED ANALYSIS:");
console.log(`clientId exact length: ${clientId.length}`);
console.log(`consumerKey exact length: ${consumerKey.length}`);

if (clientId.length > 0) {
  console.log(`clientId first 3 chars: "${clientId.substring(0, 3)}"`);
  console.log(
    `clientId last 3 chars: "${clientId.substring(clientId.length - 3)}"`
  );
}

if (consumerKey.length > 0) {
  console.log(`consumerKey first 3 chars: "${consumerKey.substring(0, 3)}"`);
  console.log(
    `consumerKey last 3 chars: "${consumerKey.substring(
      consumerKey.length - 3
    )}"`
  );
}

console.log("\n📝 RECOMMENDATIONS:");
if (clientId.trim() === "" || consumerKey.trim() === "") {
  console.log(
    "❌ CRITICAL: One or both credentials are empty. You need to set valid credentials."
  );
} else if (clientId.trim() !== clientId || consumerKey.trim() !== consumerKey) {
  console.log(
    "❌ CRITICAL: Your credentials have whitespace that needs to be removed."
  );
} else if (hasNonAsciiChars(clientId) || hasNonAsciiChars(consumerKey)) {
  console.log(
    "❌ CRITICAL: Your credentials have non-ASCII characters that need to be fixed."
  );
} else {
  console.log("✅ Your credentials appear to be properly formatted.");
  console.log(
    "If you're still having issues, verify that these are the correct values from SnapTrade."
  );
  console.log(
    "The clientId should match exactly what SnapTrade provided for your upgraded account."
  );
}
