import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Snaptrade } from 'snaptrade-typescript-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const clientId = Deno.env.get('SNAPTRADE_CLIENT_ID');
    const consumerKey = Deno.env.get('SNAPTRADE_CONSUMER_KEY');
    
    if (!clientId) {
      console.error('Missing SNAPTRADE_CLIENT_ID environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing SNAPTRADE_CLIENT_ID' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!consumerKey) {
      console.error('Missing SNAPTRADE_CONSUMER_KEY environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing SNAPTRADE_CONSUMER_KEY' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request
    let userId;
    try {
      const body = await req.json();
      userId = body.userId;
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!userId) {
      console.error('Missing userId in request body');
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Registering SnapTrade user: ${userId}`);

    // Initialize SnapTrade client
    const client = new Snaptrade({
      clientId,
      consumerKey,
    });

    // Register user
    console.log('Calling SnapTrade API to register user...');
    const response = await client.authentication.registerSnapTradeUser({
      userId,
    });

    console.log('SnapTrade API response:', response);

    if (!response.data?.userSecret) {
      console.error('Failed to register user - no userSecret in response', response);
      throw new Error('Failed to register user with SnapTrade: No userSecret returned');
    }

    console.log('User registered successfully');
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
    console.error('Error in SnapTrade registration function:', error);
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