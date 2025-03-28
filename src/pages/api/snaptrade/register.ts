import { NextApiRequest, NextApiResponse } from 'next';
import { Snaptrade } from 'snaptrade-typescript-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Initialize SnapTrade client
    const client = new Snaptrade({
      clientId: process.env.NEXT_PUBLIC_SNAPTRADE_CLIENT_ID!,
      consumerKey: process.env.NEXT_PUBLIC_SNAPTRADE_CONSUMER_KEY!,
    });

    // Register user
    const response = await client.authentication.registerSnapTradeUser({
      userId,
    });

    if (!response.data?.userSecret) {
      throw new Error('Failed to register user with SnapTrade');
    }

    return res.status(200).json({
      userId,
      userSecret: response.data.userSecret,
    });
  } catch (error) {
    console.error('Failed to register user:', error);
    return res.status(500).json({
      error: `Failed to register user: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
} 