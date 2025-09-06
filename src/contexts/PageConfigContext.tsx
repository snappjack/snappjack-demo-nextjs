'use client';

/**
 * Page Configuration Context for Next.js Snappjack Integration
 * 
 * This context enables Next.js pages to communicate their Snappjack configuration
 * up to the layout level, allowing for centralized provider management while
 * maintaining page-specific configurations.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tool } from '@snappjack/sdk-js';

interface PageConfig {
  snappId: string;
  appName: string;
  tools: Tool[];
}

interface PageConfigContextType {
  config: PageConfig | null;
  setConfig: (config: PageConfig | null) => void;
}

const PageConfigContext = createContext<PageConfigContextType | undefined>(undefined);

interface PageConfigProviderProps {
  children: ReactNode;
}

export function PageConfigProvider({ children }: PageConfigProviderProps) {
  const [config, setConfig] = useState<PageConfig | null>(null);

  return (
    <PageConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </PageConfigContext.Provider>
  );
}

export function usePageConfig(): PageConfigContextType {
  const context = useContext(PageConfigContext);
  if (context === undefined) {
    throw new Error('usePageConfig must be used within a PageConfigProvider');
  }
  return context;
}