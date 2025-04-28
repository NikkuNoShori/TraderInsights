import { Request, Response } from "express";
import { SnapTradeClient } from "@/lib/snaptrade/client";
import { createWebhookManager } from "@/lib/snaptrade/webhooks";
import { SnapTradeError } from "@/lib/snaptrade/types";

// Initialize webhook manager
const client = new SnapTradeClient({
  clientId: process.env.VITE_SNAPTRADE_CLIENT_ID!,
  consumerKey: process.env.VITE_SNAPTRADE_CONSUMER_KEY!,
});

const webhookManager = createWebhookManager(client);

/**
 * Handle incoming SnapTrade webhooks
 */
export async function handleSnapTradeWebhook(req: Request, res: Response) {
  try {
    // Get webhook signature and timestamp from headers
    const signature = req.headers["x-snaptrade-signature"] as string;
    const timestamp = req.headers["x-snaptrade-timestamp"] as string;

    if (!signature || !timestamp) {
      return res.status(400).json({
        error: "Missing required headers",
      });
    }

    // Process the webhook
    await webhookManager.processWebhook(signature, req.body, timestamp);

    // Return success response
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing SnapTrade webhook:", error);

    if (error instanceof SnapTradeError) {
      return res.status(400).json({
        error: error.message,
        code: error.code,
      });
    }

    // Return generic error for unexpected errors
    res.status(500).json({
      error: "Internal server error",
    });
  }
}
