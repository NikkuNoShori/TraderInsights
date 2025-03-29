import { NextResponse } from "next/server";
import { SnapTradeService } from "@/lib/snaptrade/client";
import { SnapTradeConfig } from "@/lib/snaptrade/types";

const config: SnapTradeConfig = {
  clientId: process.env.SNAPTRADE_CLIENT_ID || "",
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY || "",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/broker-callback`,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brokerId = searchParams.get("brokerId");
    const userId = searchParams.get("userId");

    if (!brokerId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const snapTradeService = new SnapTradeService(config);
    const connectionUrl = await snapTradeService.createConnectionLink(
      userId,
      process.env.SNAPTRADE_USER_SECRET || "",
      brokerId,
      config.redirectUri
    );

    return NextResponse.json({ url: connectionUrl });
  } catch (error) {
    console.error("Error creating broker connection:", error);
    return NextResponse.json(
      { error: "Failed to create broker connection" },
      { status: 500 }
    );
  }
}
