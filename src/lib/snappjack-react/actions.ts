'use server';

import { createUserHandler, SnappjackServerHelper, SnappjackHttpError } from '@snappjack/sdk-js';

/**
 * Retrieves the API key for a given snappId from environment variables.
 * Returns the key and the exact variable name it looked for, enabling smart logging.
 */
function getApiKeyForSnapp(snappId: string): { apiKey: string | undefined; lookedUpKey: string } {
  // Sanitize the snappId (e.g., replace hyphens with underscores) to match env var naming rules.
  const sanitizedId = snappId.replace(/-/g, '_');
  const lookedUpKey = `SNAPP_API_KEY_${sanitizedId}`;
  const apiKey = process.env[lookedUpKey];
  return { apiKey, lookedUpKey };
}

/**
 * Server Action to create a new user for a given snapp.
 * @param snappId - The ID of the snapp to create a user for
 * @returns Promise with userId or error
 */
export async function createUserAction(snappId: string): Promise<{ userId: string } | { error: string }> {
  const { apiKey, lookedUpKey } = getApiKeyForSnapp(snappId);

  // If the key is missing, return a specific, actionable error.
  if (!apiKey) {
    const errorMessage = `Configuration error for snappId '${snappId}'. The server looked for the environment variable '${lookedUpKey}' but it was not found. Please check your .env file.`;
    console.error(errorMessage);
    return { error: errorMessage };
  }

  try {
    const handler = createUserHandler({ snappApiKey: apiKey, snappId });
    const mockRequest = new Request('http://localhost', { method: 'POST' });
    const response = await handler.POST(mockRequest);
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Failed to create user' };
    }
    
    return { userId: data.userId };
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: error instanceof Error ? error.message : 'Internal server error' };
  }
}

/**
 * Server Action to generate an ephemeral token for a user
 * @param snappId - The ID of the snapp
 * @param userId - The ID of the user
 * @returns Promise with token data or error
 */
/**
 * Server Action to generate an ephemeral token for a user.
 * @param snappId - The ID of the snapp
 * @param userId - The ID of the user
 * @returns Promise with token data or error
 */
export async function generateEphemeralTokenAction(
  snappId: string, 
  userId: string
): Promise<{ token: string; expiresAt: number; snappId: string; userId: string } | { error: string; type?: string }> {
  const { apiKey, lookedUpKey } = getApiKeyForSnapp(snappId);

  // If the key is missing, return a specific, actionable error.
  if (!apiKey) {
    const errorMessage = `Configuration error for snappId '${snappId}'. The server looked for the environment variable '${lookedUpKey}' but it was not found. Please check your .env file.`;
    console.error(errorMessage);
    return { error: errorMessage, type: 'configuration_error' };
  }

  // Validate userId format (basic validation)
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return { error: 'Invalid userId' };
  }

  try {
    // Use server-side SDK to generate ephemeral token
    const snappjackHelper = new SnappjackServerHelper({
      snappApiKey: apiKey,
      snappId
    });

    const tokenData = await snappjackHelper.generateEphemeralToken(userId);
    return tokenData;

  } catch (error: unknown) {
    console.error('Ephemeral token request error:', error);
    
    // Pass through HTTP errors from SDK with their original status and body
    if (error instanceof SnappjackHttpError) {
      const body = error.body as { error?: string; type?: string };
      return {
        error: body.error || 'Failed to generate token',
        type: body.type || (error.status === 404 ? 'user_validation_error' : 'token_generation_failed')
      };
    }
    
    // Generic error fallback
    return { 
      error: error instanceof Error ? error.message : 'Internal server error'
    };
  }
}