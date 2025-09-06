'use client';

/**
 * Snappjack Provider for Next.js Applications
 * 
 * This is a thin wrapper around the framework-agnostic React SnappjackProvider
 * that injects Next.js-specific Server Actions for data fetching. This adapter
 * maintains the same public API as the original while implementing the dependency
 * injection pattern.
 */

import React from 'react';
import { Tool } from '@snappjack/sdk-js';
import { SnappjackProvider as ReactSnappjackProvider } from '../react';
import { createUserAction, generateEphemeralTokenAction } from './actions';

interface SnappjackProviderProps {
  snappId: string;
  appName: string;
  tools: Tool[];
  children: React.ReactNode;
}

export function SnappjackProvider({ 
  snappId, 
  appName, 
  tools, 
  children 
}: SnappjackProviderProps) {
  return (
    <ReactSnappjackProvider
      snappId={snappId}
      appName={appName}
      tools={tools}
      createUser={createUserAction}
      generateEphemeralToken={generateEphemeralTokenAction}
    >
      {children}
    </ReactSnappjackProvider>
  );
}