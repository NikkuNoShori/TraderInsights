import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Snaptrade } from 'snaptrade-typescript-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize SnapTrade client
    const client = new Snaptrade({
      clientId: Deno.env.get('SNAPTRADE_CLIENT_ID')!,
      consumerKey: Deno.env.get('SNAPTRADE_CONSUMER_KEY')!,
    });

    // Register user
    const response = await client.authentication.registerSnapTradeUser({
      userId,
    });

    if (!response.data?.userSecret) {
      throw new Error('Failed to register user with SnapTrade');
    }

    return new Response(
      JSON.stringify({
        userId,
        userSecret: response.data.userSecret,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Failed to register user: ${error instanceof Error ? error.message : String(error)}`,
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 