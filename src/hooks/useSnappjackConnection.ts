import { useState, useEffect, useRef } from 'react';
import { Snappjack, ConnectionData, SnappjackStatus, Tool } from '@snappjack/sdk-js';

interface Credentials {
  userId: string;
}

interface UseSnappjackConnectionProps {
  credentials: Credentials | null;
  isLoadingCredentials: boolean;
  snappId: string;
  tools: Tool[];
  autoReconnect?: boolean;
  onConnectionError?: (error: {type: string; message: string; canResetCredentials: boolean}) => void;
}

interface UseSnappjackConnectionReturn {
  status: SnappjackStatus;
  connectionData: ConnectionData | null;
  availableTools: Tool[];
}

export const useSnappjackConnection = ({ 
  credentials, 
  isLoadingCredentials, 
  snappId, 
  tools, 
  autoReconnect = true,
  onConnectionError 
}: UseSnappjackConnectionProps): UseSnappjackConnectionReturn => {
  const [status, setStatus] = useState<SnappjackStatus>('disconnected');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const snappjackRef = useRef<Snappjack | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !credentials || isLoadingCredentials) return;

    // Function to get ephemeral token and connect
    const connectWithToken = async () => {
      try {
        // Request ephemeral token from our app server
        const response = await fetch(`/api/snappjack/${snappId}/ephemeral-token/${credentials.userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to get ephemeral token: ${response.status} ${response.statusText}`);
        }

        const ephemeralToken = (await response.json()).token;
        const userId = credentials.userId;

        // Create Snappjack client with the ephemeral token
        const snappjack = new Snappjack({
          userId,
          snappId,
          ephemeralToken,
          tools,
          autoReconnect
        });
        
        snappjackRef.current = snappjack;
        setAvailableTools(tools);

        snappjack.on('status', (newStatus: SnappjackStatus) => {
          setStatus(newStatus);
        });

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
        console.error('Failed to connect with ephemeral token:', error);
        if (onConnectionError) {
          onConnectionError({
            type: 'token_fetch_failed',
            message: error instanceof Error ? error.message : 'Failed to get ephemeral token',
            canResetCredentials: false
          });
        }
      }
    };

    connectWithToken();

    return () => {
      if (snappjackRef.current) {
        snappjackRef.current.removeAllListeners();
        snappjackRef.current.disconnect();
      }
    };
  }, [credentials, isLoadingCredentials, snappId, tools, autoReconnect, onConnectionError]);

  return {
    status,
    connectionData,
    availableTools
  };
};