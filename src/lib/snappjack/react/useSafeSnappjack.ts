import { useSnappjack } from './SnappjackProvider';
import type { SnappjackStatus, ConnectionData, Tool } from '@snappjack/sdk-js';

interface SafeSnappjackReturn {
  status: SnappjackStatus | null;
  connectionData: ConnectionData | null;
  availableTools: Tool[];
  connectionError: { type: string; message: string; canResetCredentials: boolean } | null;
  isLoadingCredentials: boolean;
  resetCredentials: (() => Promise<void>) | null;
  openConnectionModal: (() => void) | null;
  client: any; // Snappjack client instance
}

/**
 * A safe version of useSnappjack for React applications that returns null values when the context 
 * is not available, instead of throwing an error. Particularly useful for layout components 
 * that may or may not be inside a SnappjackProvider.
 */
export function useSafeSnappjack(): SafeSnappjackReturn {
  try {
    return useSnappjack();
  } catch {
    // Context not available - return safe default values
    return {
      status: null,
      connectionData: null,
      availableTools: [],
      connectionError: null,
      isLoadingCredentials: false,
      resetCredentials: null,
      openConnectionModal: null,
      client: null,
    };
  }
}