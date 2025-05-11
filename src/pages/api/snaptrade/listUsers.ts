import { NextApiRequest, NextApiResponse } from "next";
import { SnapTradeClient } from "@/lib/snaptrade/client";

/**
 * API endpoint for listing SnapTrade users
 * This endpoint proxies the listUsers call to SnapTrade
 *
 * @param req NextApiRequest
 * @param res NextApiResponse
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Instantiate SnapTrade client with environment variables
    const client = new SnapTradeClient({
      clientId:
        process.env.SNAPTRADE_CLIENT_ID ||
        process.env.VITE_SNAPTRADE_CLIENT_ID ||
        "",
      consumerKey:
        process.env.SNAPTRADE_CONSUMER_KEY ||
        process.env.VITE_SNAPTRADE_CONSUMER_KEY ||
        "",
    });

    // Call the listUsers method
    const users = await client.listUsers();

    // Return the response
    return res.status(200).json(users);
  } catch (error: any) {
    console.error("Error in listUsers API:", error);
    return res.status(500).json({
      error: "Failed to list SnapTrade users",
      message: error.message || "Unknown error",
    });
  }
}
