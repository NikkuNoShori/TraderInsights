import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Snaptrade } from "https://esm.sh/snaptrade-typescript-sdk@1.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Always include CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // For non-OPTIONS requests, verify method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Verify authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { userId } = await req.json();
    console.log("Received request with userId:", userId);

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    // Check environment variables
    const clientId = Deno.env.get("SNAPTRADE_CLIENT_ID");
    const consumerKey = Deno.env.get("SNAPTRADE_CONSUMER_KEY");

    console.log("Environment variables:", {
      hasClientId: !!clientId,
      hasConsumerKey: !!consumerKey,
    });

    if (!clientId || !consumerKey) {
      throw new Error("Missing required SnapTrade configuration");
    }

    // Initialize SnapTrade client
    console.log("Initializing SnapTrade client...");
    const client = new Snaptrade({
      clientId,
      consumerKey,
    });

    // Register user
    console.log("Attempting to register user with SnapTrade...");
    const response = await client.authentication.registerSnapTradeUser({
      userId,
    });

    console.log("SnapTrade registration response:", {
      status: response.status,
      hasData: !!response.data,
      hasUserSecret: !!response.data?.userSecret,
    });

    if (!response.data?.userSecret) {
      throw new Error("Failed to register user with SnapTrade");
    }

    return new Response(
      JSON.stringify({
        userId,
        userSecret: response.data.userSecret,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in snaptrade-register function:", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: `Failed to register user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}); 