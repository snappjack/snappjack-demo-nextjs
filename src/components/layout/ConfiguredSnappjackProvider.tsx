'use client';

import { ReactNode } from 'react';
import { SnappjackProvider } from '@/lib/snappjack/nextjs';
import { usePageConfig } from '@/contexts/PageConfigContext';

interface ConfiguredSnappjackProviderProps {
  children: ReactNode;
}

/**
 * A Next.js layout wrapper component that conditionally renders the SnappjackProvider
 * based on the current page configuration. If no configuration is set
 * (e.g., on the home page), it renders children without the provider.
 * Designed to work with Next.js App Router layout system.
 */
export function ConfiguredSnappjackProvider({ children }: ConfiguredSnappjackProviderProps) {
  const { config } = usePageConfig();

  // No configuration means no Snappjack provider needed (e.g., home page)
  if (!config) {
    return <>{children}</>;
  }

  // Render children wrapped in SnappjackProvider with page-specific config
  // The key prop ensures the provider is completely re-mounted when switching
  // between different apps (different snappIds), preventing state pollution
  return (
    <SnappjackProvider
      key={config.snappId}
      snappId={config.snappId}
      appName={config.appName}
      tools={config.tools}
    >
      {children}
    </SnappjackProvider>
  );
}