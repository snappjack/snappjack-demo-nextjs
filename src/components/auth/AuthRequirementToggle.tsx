'use client';

import React, { useState } from 'react';
import { useSafeSnappjack } from '../../lib/snappjack/react/useSafeSnappjack';

interface AuthRequirementToggleProps {
  requireAuth: boolean;
  onAuthRequirementChange?: (requireAuth: boolean) => void;
}

export default function AuthRequirementToggle({
  requireAuth,
  onAuthRequirementChange
}: AuthRequirementToggleProps) {
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { client } = useSafeSnappjack();

  const handleToggle = async () => {
    if (!client) {
      setError('Snappjack client not available');
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const newRequireAuth = !requireAuth;
      await client.updateAuthRequirement(newRequireAuth);

      // No need to update local state - parent will receive update via connection-info-updated event
      onAuthRequirementChange?.(newRequireAuth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update auth requirement');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            MCP Authentication
          </span>
          <span className="text-xs text-gray-500">
            {requireAuth ? 'Bearer token required' : 'No authentication required'}
          </span>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={updating}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            requireAuth ? 'bg-blue-600' : 'bg-gray-200'
          } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="sr-only">Toggle authentication requirement</span>
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              requireAuth ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-500 min-h-[20px] flex items-center">
        {updating ? (
          <span className="text-blue-600">Updating...</span>
        ) : requireAuth ? (
          <span>🔒 Agents must provide Bearer token to access MCP endpoint</span>
        ) : (
          <span>🔓 Agents can access MCP endpoint without authentication</span>
        )}
      </div>
    </div>
  );
}