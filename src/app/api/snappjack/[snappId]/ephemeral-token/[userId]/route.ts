import { NextRequest } from 'next/server';
import { SnappjackServerHelper, SnappjackHttpError } from '@snappjack/sdk-js';

const pipsterSnappId = process.env.NEXT_PUBLIC_PIPSTER_SNAPP_ID!;
const drawitSnappId = process.env.NEXT_PUBLIC_DRAWIT_SNAPP_ID!;

// Mapping of snappId to API key
const SNAPP_API_KEY_MAPPING: Record<string, string> = {
  [pipsterSnappId]: process.env.PIPSTER_SNAPP_API_KEY!,
  [drawitSnappId]: process.env.DRAWIT_SNAPP_API_KEY!,
};

// Validate that all required environment variables are present
for (const [snappId, apiKey] of Object.entries(SNAPP_API_KEY_MAPPING)) {
  if (!apiKey) {
    throw new Error(`Missing API key for snappId: ${snappId}`);
  }
}

interface RouteParams {
  params: Promise<{
    snappId: string;
    userId: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { snappId, userId } = await params;
  
  try {
    // Check if the snappId is supported
    const snappApiKey = SNAPP_API_KEY_MAPPING[snappId];
    if (!snappApiKey) {
      return new Response(JSON.stringify({ 
        error: `Unsupported snappId: ${snappId}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate userId format (basic validation)
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid userId' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use server-side SDK to generate ephemeral token
    const snappjackHelper = new SnappjackServerHelper({
      snappApiKey,
      snappId
    });

    const tokenData = await snappjackHelper.generateEphemeralToken(userId);
    
    return new Response(JSON.stringify(tokenData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error: unknown) {
    console.error('Ephemeral token request error:', error);
    
    // Pass through HTTP errors from SDK with their original status and body
    if (error instanceof SnappjackHttpError) {
      return new Response(JSON.stringify(error.body), {
        status: error.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generic error fallback
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}