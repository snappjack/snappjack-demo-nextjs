/**
 * Snappjack Next.js Module
 * 
 * A Next.js-specific adapter for the Snappjack React library. This module provides
 * the same client-side components and hooks as the React library, but with Next.js
 * Server Actions automatically injected for data fetching. This maintains zero breaking
 * changes for existing Next.js applications while leveraging the new architecture.
 */

// Next.js provider with Server Actions pre-configured
export { SnappjackProvider } from './SnappjackProvider';

// Re-export all hooks and components from the React layer for convenience
export { 
  useSnappjack, 
  useSafeSnappjack,
  useSnappjackCredentials,
  useSnappjackConnection,
  ConnectionDetailsModal,
  MiniConnectionStatus,
  SnappjackConnectionError
} from '../react';

// Re-export types that consumers might need
export type { 
  ConnectionData, 
  SnappjackStatus, 
  Tool 
} from '@snappjack/sdk-js';