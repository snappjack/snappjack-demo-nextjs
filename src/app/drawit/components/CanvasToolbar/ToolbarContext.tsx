'use client';

import { createContext, useContext } from 'react';
import { ToolbarLayoutProps } from './types';

const ToolbarContext = createContext<ToolbarLayoutProps | null>(null);

export const useToolbarContext = () => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbarContext must be used within a ToolbarProvider');
  }
  return context;
};

export default ToolbarContext;