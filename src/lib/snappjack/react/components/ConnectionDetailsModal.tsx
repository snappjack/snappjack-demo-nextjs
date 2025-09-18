'use client';

import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import AuthRequirementToggle from './AuthRequirementToggle';

interface ConnectionData {
  snappId?: string;
  userId?: string;
  serverUrl?: string;
  mcpEndpoint?: string;
  userApiKey?: string;
  requireAuthHeader?: boolean;
}

interface Tool {
  name: string;
  description?: string;
}

interface ConnectionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  connectionData?: ConnectionData | null;
  availableTools?: Tool[];
}

export function ConnectionDetailsModal({ 
  isOpen, 
  onClose, 
  appName, 
  connectionData, 
  availableTools = [] 
}: ConnectionDetailsModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'direct' | 'cursor' | 'claude' | 'cli'>('direct');
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap (without initial focus)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Don't focus anything initially - let user decide what to interact with

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
    return undefined;
  }, [isOpen]);

  const handleCopyConfig = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getConfigurationContent = () => {
    if (!connectionData) return '';

    const name = appName.toLowerCase() || "snappjack-demo";
    const requireAuth = connectionData.requireAuthHeader ?? true;

    switch (selectedMethod) {
      case 'direct':
        return null; // Direct method shows separate fields

      case 'cursor': {
        const cursorConfig = {
          [name]: {
            type: 'http',
            url: connectionData.mcpEndpoint || '',
            ...(requireAuth && {
              headers: { Authorization: `Bearer ${connectionData.userApiKey || ''}` }
            })
          }
        };
        return JSON.stringify(cursorConfig, null, 2);
      }

      case 'claude': {
        const claudeConfig = {
          [name]: {
            command: "npx",
            args: [
              "mcp-remote",
              connectionData.mcpEndpoint || '',
              ...(requireAuth ? [
                "--header",
                "Authorization:${AUTH_TOKEN}"
              ] : [])
            ],
            ...(requireAuth && {
              env: {
                AUTH_TOKEN: `Bearer ${connectionData.userApiKey || ''}`
              }
            })
          }
        };
        return JSON.stringify(claudeConfig, null, 2);
      }

      case 'cli':
        return requireAuth
          ? `claude mcp add --transport http ${name} ${connectionData.mcpEndpoint || ''} \\
  --header "Authorization: Bearer ${connectionData.userApiKey || ''}"`
          : `claude mcp add --transport http ${name} ${connectionData.mcpEndpoint || ''}`;

      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 dark:bg-gray-400/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Dialog */}
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-4 relative max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Connection Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Agent Configuration */}
          {connectionData && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Agent Configuration</h4>
              
              {/* Method tabs */}
              <div className="flex gap-1 mb-2">
                <button
                  data-method="direct"
                  onClick={() => setSelectedMethod('direct')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'direct'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Direct
                </button>
                <button
                  data-method="cursor"
                  onClick={() => setSelectedMethod('cursor')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'cursor'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Cursor
                </button>
                <button
                  data-method="claude"
                  onClick={() => setSelectedMethod('claude')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'claude'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  data-method="cli"
                  onClick={() => setSelectedMethod('cli')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'cli'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  CLI
                </button>
              </div>

              {/* Configuration content */}
              {selectedMethod === 'direct' ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400">MCP Endpoint:</label>
                    <div className="flex gap-1 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={connectionData.mcpEndpoint || ''}
                        className="flex-1 px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                      />
                      <button
                        onClick={() => handleCopyConfig(connectionData.mcpEndpoint || '')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Copy"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  {(connectionData.requireAuthHeader ?? true) && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Authorization Bearer Token:</label>
                      <div className="flex gap-1 mt-0.5">
                        <input
                          type="text"
                          readOnly
                          value={connectionData.userApiKey || ''}
                          className="flex-1 px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
                        />
                        <button
                          onClick={() => handleCopyConfig(connectionData.userApiKey || '')}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Copy"
                        >
                          <ClipboardDocumentIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2 text-xs font-mono relative">
                  <pre className="whitespace-pre-wrap break-all text-[10px] pr-8 text-gray-900 dark:text-gray-100">
{getConfigurationContent()}
                  </pre>
                  <button
                    onClick={() => handleCopyConfig(getConfigurationContent() || '')}
                    className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                    title="Copy configuration"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              )}
              
              {copySuccess && (
                <div className="mt-1 text-xs text-green-600 dark:text-green-400">Copied!</div>
              )}
            </div>
          )}

          {/* Authentication Settings */}
          {connectionData && connectionData.snappId && connectionData.userId && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Security Settings</h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                <AuthRequirementToggle
                  requireAuth={connectionData.requireAuthHeader ?? true}
                  onAuthRequirementChange={(requireAuth) => {
                    // Optionally handle the change, could update connection data
                    console.log('Auth requirement changed:', requireAuth);
                  }}
                />
              </div>
            </div>
          )}

          {/* Available Tools */}
          {availableTools.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Available Tools ({availableTools.length})</h4>
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-1">
                  {availableTools.map((tool, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                      <div className="text-xs font-medium text-black dark:text-gray-100">{tool.name}</div>
                      {tool.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tool.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No data message */}
          {!connectionData && availableTools.length === 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              No connection information available. Connect to see details.
            </div>
          )}
        </div>
      </div>
    </>
  );
}