/**
 * Snappjack React Module
 * 
 * A framework-agnostic React library for integrating Snappjack with React applications.
 * This module provides client-side provider components and hooks for managing credentials,
 * connections, and UI components for the Snappjack bridge server. Uses dependency injection
 * to remain completely decoupled from any specific data-fetching implementation.
 */

// Main provider and hooks for full Snappjack integration
export { SnappjackProvider, useSnappjack } from './SnappjackProvider';
export { useSafeSnappjack } from './useSafeSnappjack';

// Individual hooks for advanced use cases
export { useSnappjackCredentials } from './useSnappjackCredentials';
export { useSnappjackConnection } from './useSnappjackConnection';

// UI components
export { ConnectionDetailsModal } from './components/ConnectionDetailsModal';
export { MiniConnectionStatus } from './components/MiniConnectionStatus';
export { SnappjackConnectionError } from './components/SnappjackConnectionError';

// Re-export types that consumers might need
export type { 
  ConnectionData, 
  SnappjackStatus, 
  Tool 
} from '@snappjack/sdk-js';