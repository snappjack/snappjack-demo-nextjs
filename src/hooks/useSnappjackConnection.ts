import { useState, useEffect, useRef } from 'react';
import { Snappjack, ConnectionData, SnappjackStatus, Tool } from '@snappjack/sdk-js';

interface Credentials {
  userId: string;
  userApiKey: string;
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

    const snappjack = new Snappjack({
      userId: credentials.userId,
      userApiKey: credentials.userApiKey,
      snappId,
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

    snappjack.connect().catch((error: Error) => {
      console.error('Connection failed:', error);
      if (onConnectionError) {
        onConnectionError({
          type: 'connection_failed',
          message: error.message,
          canResetCredentials: false
        });
      }
    });

    return () => {
      snappjack.removeAllListeners();
      snappjack.disconnect();
    };
  }, [credentials, isLoadingCredentials, snappId, tools, autoReconnect, onConnectionError]);

  return {
    status,
    connectionData,
    availableTools
  };
};