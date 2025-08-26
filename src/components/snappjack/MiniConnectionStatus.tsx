'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftRightIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface ConnectionData {
  snappId?: string;
  userId?: string;
  serverUrl?: string;
  mcpEndpoint?: string;
  userApiKey?: string;
}

interface Tool {
  name: string;
  description?: string;
}

interface MiniConnectionStatusProps {
  status: 'connecting' | 'connected' | 'bridged' | 'disconnected' | 'error';
  appName: string;
  connectionData?: ConnectionData | null;
  availableTools?: Tool[];
}

export function MiniConnectionStatus({ status, appName, connectionData, availableTools = [] }: MiniConnectionStatusProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'direct' | 'cursor' | 'claude' | 'cli'>('direct');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const handleCopyConfig = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getConfigurationContent = () => {
    if (!connectionData) return '';
    
    const name = appName.toLowerCase() || "snappjack-demo";

    switch (selectedMethod) {
      case 'direct':
        return null; // Direct method shows separate fields
      
      case 'cursor': {
        const cursorConfig = {
          [name]: {
            type: 'http',
            url: connectionData.mcpEndpoint || '',
            headers: { Authorization: `Bearer ${connectionData.userApiKey || ''}` }
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
              "--header",
              "Authorization:${AUTH_TOKEN}"
            ],
            env: {
              AUTH_TOKEN: `Bearer ${connectionData.userApiKey || ''}`
            }
          }
        };
        return JSON.stringify(claudeConfig, null, 2);
      }
      
      case 'cli':
        return `claude mcp add --transport http ${name} ${connectionData.mcpEndpoint || ''} \\
  --header "Authorization: Bearer ${connectionData.userApiKey || ''}"`;
      
      default:
        return '';
    }
  };
  const getAgentConnectionColor = () => {
    switch (status) {
      case 'bridged':
        return 'stroke-green-500';
      case 'connected':
      case 'connecting':
      case 'disconnected':
        return 'stroke-gray-300';
      case 'error':
        return 'stroke-red-500';
      default:
        return 'stroke-gray-300';
    }
  };

  const getAppConnectionColor = () => {
    switch (status) {
      case 'connecting':
        return 'stroke-yellow-500';
      case 'connected':
      case 'bridged':
        return 'stroke-green-500';
      case 'disconnected':
        return 'stroke-gray-300';
      case 'error':
        return 'stroke-red-500';
      default:
        return 'stroke-gray-300';
    }
  };

  const getSnappjackColor = () => {
    switch (status) {
      case 'connecting':
        return 'bg-yellow-500';
      case 'connected':
        return 'bg-blue-500';
      case 'bridged':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const isPulsing = status === 'connecting';

  return (
    <div className="relative">
      <div 
        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowPopup(!showPopup)}
      >
        {/* Mini connection diagram */}
        <div className="flex items-center">
        {/* Agent icon */}
        <div className="relative">
          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-600" />
          {status === 'bridged' && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
        
        {/* Agent to Snappjack line */}
        <svg width="20" height="2" className="mx-0.5">
          <line 
            x1="0" 
            y1="1" 
            x2="20" 
            y2="1" 
            className={getAgentConnectionColor()}
            strokeWidth="2"
            strokeDasharray={status === 'bridged' ? '0' : '2 2'}
          />
        </svg>
        
        {/* Snappjack center */}
        <div className={`relative w-5 h-5 rounded-full ${getSnappjackColor()} ${isPulsing ? 'animate-pulse' : ''} flex items-center justify-center`}>
          <span className="text-[10px] text-white font-bold">S</span>
        </div>
        
        {/* Snappjack to App line */}
        <svg width="20" height="2" className="mx-0.5">
          <line 
            x1="0" 
            y1="1" 
            x2="20" 
            y2="1" 
            className={getAppConnectionColor()}
            strokeWidth="2"
            strokeDasharray={status === 'connecting' ? '2 2' : '0'}
          />
        </svg>
        
        {/* App icon */}
        <div className="relative">
          <div className="w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">
              {appName === 'Pipster' ? 'P' : appName === 'DrawIt' ? 'D' : 'A'}
            </span>
          </div>
          {(status === 'connected' || status === 'bridged') && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
      </div>
      
        {/* Status text */}
        <span className="text-xs text-gray-600">
          {status === 'connecting' && 'Connecting...'}
          {status === 'connected' && 'Connected'}
          {status === 'bridged' && 'Agent active'}
          {status === 'disconnected' && 'Disconnected'}
          {status === 'error' && 'Error'}
        </span>
      </div>

      {/* Popup */}
      {showPopup && (
        <div ref={popupRef} className="absolute top-full mt-2 left-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[400px]">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Connection Details</h3>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Agent Configuration */}
          {connectionData && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Agent Configuration</h4>
              
              {/* Method tabs */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setSelectedMethod('direct')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'direct' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Direct
                </button>
                <button
                  onClick={() => setSelectedMethod('cursor')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'cursor' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Cursor
                </button>
                <button
                  onClick={() => setSelectedMethod('claude')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'claude' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  onClick={() => setSelectedMethod('cli')}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedMethod === 'cli' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  CLI
                </button>
              </div>

              {/* Configuration content */}
              {selectedMethod === 'direct' ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">MCP Endpoint:</label>
                    <div className="flex gap-1 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={connectionData.mcpEndpoint || ''}
                        className="flex-1 px-2 py-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded"
                      />
                      <button
                        onClick={() => handleCopyConfig(connectionData.mcpEndpoint || '')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">API Key:</label>
                    <div className="flex gap-1 mt-0.5">
                      <input
                        type="text"
                        readOnly
                        value={connectionData.userApiKey || ''}
                        className="flex-1 px-2 py-1 text-xs font-mono bg-gray-50 border border-gray-200 rounded"
                      />
                      <button
                        onClick={() => handleCopyConfig(connectionData.userApiKey || '')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy"
                      >
                        <ClipboardDocumentIcon className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-md p-2 text-xs font-mono relative">
                  <pre className="whitespace-pre-wrap break-all text-[10px] pr-8">
{getConfigurationContent()}
                  </pre>
                  <button
                    onClick={() => handleCopyConfig(getConfigurationContent() || '')}
                    className="absolute top-2 right-2 p-1 bg-white hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                    title="Copy configuration"
                  >
                    <ClipboardDocumentIcon className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              )}
              
              {copySuccess && (
                <div className="mt-1 text-xs text-green-600">Copied!</div>
              )}
            </div>
          )}

          {/* Available Tools */}
          {availableTools.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-2">Available Tools ({availableTools.length})</h4>
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-1">
                  {availableTools.map((tool, index) => (
                    <div key={index} className="bg-gray-50 rounded p-2">
                      <div className="text-xs font-medium text-gray-800">{tool.name}</div>
                      {tool.description && (
                        <div className="text-xs text-gray-600 mt-0.5">{tool.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No data message */}
          {!connectionData && availableTools.length === 0 && (
            <div className="text-xs text-gray-500">
              No connection information available. Connect to see details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}