'use client';

import React, { createContext, useContext, useState } from 'react';
import { ConnectionData, SnappjackStatus, Tool, Snappjack } from '@snappjack/sdk-js';
import { useSnappjackCredentials } from './useSnappjackCredentials';
import { useSnappjackConnection } from './useSnappjackConnection';
import { ConnectionDetailsModal } from './components/ConnectionDetailsModal';

interface CreateUserFunction {
  (snappId: string): Promise<{ userId: string } | { error: string }>;
}

interface GenerateEphemeralTokenFunction {
  (snappId: string, userId: string): Promise<{ token: string; expiresAt: number; snappId: string; userId: string } | { error: string; type?: string }>;
}

interface SnappjackProviderProps {
  snappId: string;
  appName: string;
  tools: Tool[];
  createUser: CreateUserFunction;
  generateEphemeralToken: GenerateEphemeralTokenFunction;
  children: React.ReactNode;
}

interface SnappjackContextValue {
  status: SnappjackStatus;
  connectionData: ConnectionData | null;
  availableTools: Tool[];
  connectionError: { type: string; message: string; canResetCredentials: boolean } | null;
  isLoadingCredentials: boolean;
  resetCredentials: () => Promise<void>;
  openConnectionModal: () => void;
  client: Snappjack | null; // Snappjack client instance
}

const SnappjackContext = createContext<SnappjackContextValue | undefined>(undefined);

export function SnappjackProvider({ 
  snappId, 
  appName, 
  tools, 
  createUser, 
  generateEphemeralToken, 
  children 
}: SnappjackProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use refactored hooks with injected dependencies
  const { 
    credentials, 
    isLoadingCredentials, 
    connectionError, 
    resetCredentials, 
    setConnectionError 
  } = useSnappjackCredentials({
    appName,
    snappId,
    createUser
  });

  const { status, connectionData, availableTools, client } = useSnappjackConnection({
    credentials,
    isLoadingCredentials,
    snappId,
    tools,
    generateEphemeralToken,
    onConnectionError: setConnectionError
  });

  const openConnectionModal = () => setIsModalOpen(true);
  const closeConnectionModal = () => setIsModalOpen(false);

  const contextValue: SnappjackContextValue = {
    status,
    connectionData,
    availableTools,
    connectionError,
    isLoadingCredentials,
    resetCredentials,
    openConnectionModal,
    client
  };

  return (
    <SnappjackContext.Provider value={contextValue}>
      {children}
      
      {/* Integrated Connection Details Modal */}
      <ConnectionDetailsModal
        isOpen={isModalOpen}
        onClose={closeConnectionModal}
        appName={appName}
        connectionData={connectionData}
        availableTools={availableTools}
      />
    </SnappjackContext.Provider>
  );
}

export function useSnappjack(): SnappjackContextValue {
  const context = useContext(SnappjackContext);
  if (context === undefined) {
    throw new Error('useSnappjack must be used within a SnappjackProvider');
  }
  return context;
}