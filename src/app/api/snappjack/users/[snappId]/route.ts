import { createUserHandler } from '@snappjack/sdk-js/server';

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
  }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { snappId } = await params;
  
  // Check if the snappId is supported
  const apiKey = SNAPP_API_KEY_MAPPING[snappId];
  if (!apiKey) {
    return new Response(JSON.stringify({ 
      error: `Unsupported snappId: ${snappId}` 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Create the handler with the appropriate configuration
  const config = {
    snappApiKey: apiKey,
    snappId: snappId
  };

  const handler = createUserHandler(config);
  return handler.POST(request);
}