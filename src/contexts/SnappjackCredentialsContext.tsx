'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Snappjack } from '@snappjack/sdk-js';

interface Credentials {
  userId: string;
  userApiKey: string;
}

interface CredentialsContextType {
  credentials: Credentials | null;
  isLoading: boolean;
  error: {type: string; message: string; canResetCredentials: boolean} | null;
  resetCredentials: () => Promise<void>;
}

const SnappjackCredentialsContext = createContext<CredentialsContextType | undefined>(undefined);

interface SnappjackCredentialsProviderProps {
  children: ReactNode;
}

export const SnappjackCredentialsProvider: React.FC<SnappjackCredentialsProviderProps> = ({ children }) => {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{type: string; message: string; canResetCredentials: boolean} | null>(null);

  const resetCredentials = useCallback(async () => {
    const appId = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID!;
    const storageKey = `snappjack-credentials-${appId}`;
    
    // Clear existing credentials
    localStorage.removeItem(storageKey);
    setCredentials(null);
    setError(null);
    setIsLoading(true);
    
    try {
      console.log('Creating new user after credential reset...');
      const result = await Snappjack.createUser('/api/snappjack/users');
      const newCredentials = {
        userId: result.userId,
        userApiKey: result.userApiKey
      };
      localStorage.setItem(storageKey, JSON.stringify(newCredentials));
      setCredentials(newCredentials);
      console.log('New user created:', result.userId);
    } catch (error) {
      console.error('Failed to create new user:', error);
      setError({
        type: 'user_creation_failed',
        message: 'Failed to create new user. Please check your connection and try again.',
        canResetCredentials: false
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize credentials on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const appId = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID!;
    const storageKey = `snappjack-credentials-${appId}`;
    
    // Check localStorage for existing credentials
    const storedCredentials = localStorage.getItem(storageKey);
    if (storedCredentials) {
      try {
        const parsed = JSON.parse(storedCredentials);
        setCredentials(parsed);
        console.log('Found existing credentials:', parsed.userId);
        setIsLoading(false);
        return; // Exit early if we found valid credentials
      } catch (error) {
        console.error('Failed to parse stored credentials:', error);
        localStorage.removeItem(storageKey);
        // Fall through to create new user
      }
    }
    
    // Create new user only if no valid credentials found
    console.log('No credentials found, creating new user...');
    Snappjack.createUser('/api/snappjack/users')
      .then((result) => {
        const newCredentials = {
          userId: result.userId,
          userApiKey: result.userApiKey
        };
        localStorage.setItem(storageKey, JSON.stringify(newCredentials));
        setCredentials(newCredentials);
        console.log('Created new user:', result.userId);
      })
      .catch((error) => {
        console.error('Failed to create user:', error);
        setError({
          type: 'user_creation_failed',
          message: 'Failed to create user. Please check your connection and try again.',
          canResetCredentials: true
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const value: CredentialsContextType = {
    credentials,
    isLoading,
    error,
    resetCredentials
  };

  return (
    <SnappjackCredentialsContext.Provider value={value}>
      {children}
    </SnappjackCredentialsContext.Provider>
  );
};

export const useSnappjackCredentials = (): CredentialsContextType => {
  const context = useContext(SnappjackCredentialsContext);
  if (context === undefined) {
    throw new Error('useSnappjackCredentials must be used within a SnappjackCredentialsProvider');
  }
  return context;
};