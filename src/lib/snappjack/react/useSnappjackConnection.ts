import { useState, useEffect, useRef } from 'react';
import { Snappjack, ConnectionData, SnappjackStatus, Tool } from '@snappjack/sdk-js';

interface Credentials {
  userId: string;
}

interface GenerateEphemeralTokenFunction {
  (snappId: string, userId: string): Promise<{ token: string; expiresAt: number; snappId: string; userId: string } | { error: string; type?: string }>;
}

interface UseSnappjackConnectionProps {
  credentials: Credentials | null;
  isLoadingCredentials: boolean;
  snappId: string;
  tools: Tool[];
  generateEphemeralToken: GenerateEphemeralTokenFunction;
  autoReconnect?: boolean;
  onConnectionError?: (error: {type: string; message: string; canResetCredentials: boolean}) => void;
}

interface UseSnappjackConnectionReturn {
  status: SnappjackStatus;
  connectionData: ConnectionData | null;
  availableTools: Tool[];
  client: Snappjack | null;
}

export const useSnappjackConnection = ({ 
  credentials, 
  isLoadingCredentials, 
  snappId, 
  tools, 
  generateEphemeralToken,
  autoReconnect = true,
  onConnectionError 
}: UseSnappjackConnectionProps): UseSnappjackConnectionReturn => {
  const [status, setStatus] = useState<SnappjackStatus>('disconnected');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const snappjackRef = useRef<Snappjack | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !credentials || isLoadingCredentials) return;

    // Function to connect with token provider
    const connect = async () => {
      try {
        // Create token provider function that captures current credentials
        const tokenProvider = async (): Promise<string> => {
          const tokenResult = await generateEphemeralToken(snappId, credentials.userId);
          
          if ('error' in tokenResult) {
            // Handle structured error from generateEphemeralToken function
            const errorType = tokenResult.type === 'user_validation_error' ? 'invalid_user_id' : 'token_fetch_failed';
            const canResetCredentials = tokenResult.type === 'user_validation_error';
            
            throw new Error(JSON.stringify({ 
              type: errorType, 
              message: tokenResult.error, 
              canResetCredentials 
            }));
          }
          
          return tokenResult.token;
        };

        // Create Snappjack client with the token provider
        const snappjack = new Snappjack({
          userId: credentials.userId,
          snappId,
          tokenProvider,
          tools,
          autoReconnect
        });
        
        snappjackRef.current = snappjack;
        setAvailableTools(tools);

        snappjack.on('status', (newStatus: SnappjackStatus) => {
          setStatus(newStatus);
        });

        // Use new event name but keep backward compatibility
        snappjack.on('connection-info-updated', (data: ConnectionData) => {
          setConnectionData(data);
          console.log('App connected via Snappjack!');
        });
        
        // Backward compatibility for older SDK versions
        snappjack.on('user-api-key-generated', (data: ConnectionData) => {
          setConnectionData(data);
          console.log('App connected via Snappjack!');
        });

        snappjack.on('connection-error', (error: {type: string; message: string; canResetCredentials: boolean}) => {
          console.error('Connection error:', error);
          if (onConnectionError) {
            onConnectionError(error);
          }
        });

        await snappjack.connect();
        
      } catch (error) {
        console.error('Failed to connect:', error);
        if (onConnectionError) {
          // Try to parse structured error from our custom error format
          if (error instanceof Error) {
            try {
              const errorData = JSON.parse(error.message);
              if (errorData.type && errorData.message !== undefined && errorData.canResetCredentials !== undefined) {
                onConnectionError(errorData);
                return;
              }
            } catch {
              // If parsing fails, fall through to default error
            }
          }
          
          // Default error handling
          onConnectionError({
            type: 'token_fetch_failed',
            message: error instanceof Error ? error.message : 'Failed to get ephemeral token',
            canResetCredentials: false
          });
        }
      }
    };

    connect();

    return () => {
      if (snappjackRef.current) {
        snappjackRef.current.removeAllListeners();
        snappjackRef.current.disconnect();
      }
    };
  }, [credentials, isLoadingCredentials, snappId, tools, generateEphemeralToken, autoReconnect, onConnectionError]);

  return {
    status,
    connectionData,
    availableTools,
    client: snappjackRef.current
  };
};