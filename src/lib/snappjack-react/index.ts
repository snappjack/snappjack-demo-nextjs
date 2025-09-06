/**
 * Snappjack React Module
 * 
 * A self-contained module for integrating Snappjack with React applications.
 * This module provides hooks for managing credentials and connections to the
 * Snappjack bridge server, enabling AI agents to interact with web applications
 * through the Model Context Protocol (MCP).
 */

export { useSnappjackCredentials } from './useSnappjackCredentials';
export { useSnappjackConnection } from './useSnappjackConnection';

// Re-export types that consumers might need
export type { 
  ConnectionData, 
  SnappjackStatus, 
  Tool 
} from '@snappjack/sdk-js';