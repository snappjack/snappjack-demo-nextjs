import { SnappjackServerHelper } from '@snappjack/sdk-js/server';
import { NextRequest } from 'next/server';

const SNAPPJACK_APP_ID = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID; // required
const SNAPPJACK_APP_API_KEY = process.env.SNAPPJACK_APP_API_KEY; // required

if (!SNAPPJACK_APP_ID) {
  throw new Error('environment variable NEXT_PUBLIC_SNAPPJACK_APP_ID must be set');
}

if (!SNAPPJACK_APP_API_KEY) {
  throw new Error('environment variable SNAPPJACK_APP_API_KEY must be set');
}

// Initialize the server helper - it will auto-detect server URL from environment
const snappjackHelper = new SnappjackServerHelper({
  snappjackAppApiKey: SNAPPJACK_APP_API_KEY
  // snappjackServerUrl is optional - auto-detects from NEXT_PUBLIC_SNAPPJACK_SERVER_URL
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snappjackAppId = searchParams.get('snappjackAppId');
    const userId = searchParams.get('userId');

    if (!snappjackAppId || !userId) {
      return Response.json({ 
        error: 'snappjackAppId and userId query parameters are required' 
      }, { status: 400 });
    }

    // Optional: Add your own validation here
    // For example, validate that the snappjackAppId matches your app
    if (snappjackAppId !== SNAPPJACK_APP_ID) {
      return Response.json({ 
        error: 'Invalid snappjackAppId' 
      }, { status: 403 });
    }

    // Optional: Add user authentication/authorization here
    // For example, validate userId against your user session
    
    const result = await snappjackHelper.generateUserApiKey(snappjackAppId, userId);
    
    return Response.json(result, {
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Snappjack token generation error:', error);
    
    return Response.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

