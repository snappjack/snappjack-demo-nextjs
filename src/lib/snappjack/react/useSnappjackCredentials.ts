import { useState, useEffect, useCallback } from 'react';

interface Credentials {
  userId: string;
}

interface CreateUserFunction {
  (snappId: string): Promise<{ userId: string } | { error: string }>;
}

interface UseSnappjackCredentialsProps {
  appName: string;
  snappId: string;
  createUser: CreateUserFunction;
}

interface UseSnappjackCredentialsReturn {
  credentials: Credentials | null;
  isLoadingCredentials: boolean;
  connectionError: {type: string; message: string; canResetCredentials: boolean} | null;
  resetCredentials: () => Promise<void>;
  setConnectionError: (error: {type: string; message: string; canResetCredentials: boolean} | null) => void;
}

export const useSnappjackCredentials = ({ 
  appName, 
  snappId, 
  createUser 
}: UseSnappjackCredentialsProps): UseSnappjackCredentialsReturn => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);
  const [connectionError, setConnectionError] = useState<{type: string; message: string; canResetCredentials: boolean} | null>(null);

  // App-specific configuration
  const storageKey = `snappjack-credentials-${snappId}`;

  // Initialize credentials on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check localStorage for existing credentials
    const storedCredentials = localStorage.getItem(storageKey);
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        setCredentials(parsed);
        console.log(`${appName}: Found existing credentials:`, parsed.userId);
        setIsLoadingCredentials(false);
        return;
      } catch (error) {
        console.error(`${appName}: Failed to parse stored credentials:`, error);
        localStorage.removeItem(storageKey);
      }
    }
    
    // Create new user if no valid credentials found
    console.log(`${appName}: No credentials found, creating new user...`);
    
    createUser(snappId)
      .then((result) => {
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        const newCredentials = {
          userId: result.userId
        };
        localStorage.setItem(storageKey, JSON.stringify(newCredentials));
        setCredentials(newCredentials);
        console.log(`${appName}: Created new user:`, result.userId);
      })
      .catch((error) => {
        console.error(`${appName}: Failed to create user:`, error);
        setConnectionError({
          type: 'user_creation_failed',
          message: 'Failed to create user. Please check your connection and try again.',
          canResetCredentials: true
        });
      })
      .finally(() => {
        setIsLoadingCredentials(false);
      });
  }, [appName, snappId, storageKey, createUser]);

  // Function to reset credentials and create new user
  const resetCredentials = useCallback(async () => {
    // Clear existing credentials
    localStorage.removeItem(storageKey);
    setCredentials(null);
    setConnectionError(null);
    setIsLoadingCredentials(true);
    
    try {
      console.log(`${appName}: Creating new user after credential reset...`);
      
      const result = await createUser(snappId);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      const newCredentials = {
        userId: result.userId
      };
      localStorage.setItem(storageKey, JSON.stringify(newCredentials));
      setCredentials(newCredentials);
      console.log(`${appName}: New user created:`, result.userId);
    } catch (error) {
      console.error(`${appName}: Failed to create new user:`, error);
      setConnectionError({
        type: 'user_creation_failed',
        message: 'Failed to create new user. Please check your connection and try again.',
        canResetCredentials: false
      });
    } finally {
      setIsLoadingCredentials(false);
    }
  }, [appName, snappId, storageKey, createUser]);

  return {
    credentials,
    isLoadingCredentials,
    connectionError,
    resetCredentials,
    setConnectionError
  };
};