import { NextApiRequest, NextApiResponse } from 'next';
import { Snaptrade } from 'snaptrade-typescript-sdk';
import crypto from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHmac("sha256", process.env.VITE_SNAPTRADE_CONSUMER_KEY!)
      .update(`${process.env.VITE_SNAPTRADE_CLIENT_ID}${timestamp}`)
      .digest("hex");

    // Initialize SnapTrade client
    const client = new Snaptrade({
      clientId: process.env.VITE_SNAPTRADE_CLIENT_ID!,
      consumerKey: process.env.VITE_SNAPTRADE_CONSUMER_KEY!,
      timestamp,
      signature,
    });

    // Register user
    const response = await client.authentication.registerSnapTradeUser({
      userId,
    });

    if (!response.data?.userSecret) {
      throw new Error("Failed to register user with SnapTrade");
    }

    return res.status(200).json({
      userId,
      userSecret: response.data.userSecret,
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    return res.status(500).json({
      error: `Failed to register user: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
} 