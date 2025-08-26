'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConnectionData {
  snappId?: string;
  userId?: string;
  serverUrl?: string;
  mcpEndpoint?: string;
  userApiKey?: string;
}

interface Tool {
  name: string;
  description?: string;
}

interface ConnectionStatusContextType {
  status: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error' | null;
  appName: string;
  connectionData: ConnectionData | null;
  availableTools: Tool[];
  setConnectionStatus: (
    status: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error' | null,
    appName?: string,
    connectionData?: ConnectionData | null,
    availableTools?: Tool[]
  ) => void;
}

const ConnectionStatusContext = createContext<ConnectionStatusContextType | undefined>(undefined);

export function ConnectionStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error' | null>(null);
  const [appName, setAppName] = useState<string>('');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  const setConnectionStatus = (
    newStatus: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error' | null,
    newAppName?: string,
    newConnectionData?: ConnectionData | null,
    newAvailableTools?: Tool[]
  ) => {
    setStatus(newStatus);
    if (newAppName !== undefined) {
      setAppName(newAppName);
    }
    if (newConnectionData !== undefined) {
      setConnectionData(newConnectionData);
    }
    if (newAvailableTools !== undefined) {
      setAvailableTools(newAvailableTools);
    }
  };

  return (
    <ConnectionStatusContext.Provider value={{ status, appName, connectionData, availableTools, setConnectionStatus }}>
      {children}
    </ConnectionStatusContext.Provider>
  );
}

export function useConnectionStatus() {
  const context = useContext(ConnectionStatusContext);
  if (context === undefined) {
    throw new Error('useConnectionStatus must be used within a ConnectionStatusProvider');
  }
  return context;
}

// Hook to update connection status from page components
export function useSetConnectionStatus(
  status: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error',
  appName: string,
  connectionData?: ConnectionData | null,
  availableTools?: Tool[]
) {
  const { setConnectionStatus } = useConnectionStatus();
  
  useEffect(() => {
    setConnectionStatus(status, appName, connectionData, availableTools);
    
    // Clear status when component unmounts
    return () => {
      setConnectionStatus(null);
    };
  }, [status, appName, connectionData, availableTools, setConnectionStatus]);
}