'use client';

import { useState } from 'react';
import { AgentConfigProps } from '@/app/pipster/types/pipster';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ChatbotIcon } from '@/components/icons/ChatbotIcon';

export function SnappjackAgentConfig({ connectionData, appName }: AgentConfigProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!connectionData) return null;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const name = appName || "snappjack-demo";

  // Cursor configuration
  const cursorConfig = {
    [name]: {
      type: 'http',
      url: connectionData.mcpEndpoint,
      headers: { Authorization: `Bearer ${connectionData.userApiKey}` }
    }
  };

  // Claude Desktop configuration
  const claudeDesktopConfig = {
    [name]: {
      command: "npx",
      args: [
        "mcp-remote",
        connectionData.mcpEndpoint,
        "--header",
        "Authorization:${AUTH_TOKEN}"
      ],
      env: {
        AUTH_TOKEN: `Bearer ${connectionData.userApiKey}`
      }
    }
  };

  const cursorConfigJson = JSON.stringify(cursorConfig, null, 2);
  const claudeDesktopConfigJson = JSON.stringify(claudeDesktopConfig, null, 2);
  const cliCommand = `claude mcp add --transport http ${name} ${connectionData.mcpEndpoint} \\
  --header "Authorization: Bearer ${connectionData.userApiKey}"`;

  return (
    <div className="mt-10 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
      <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <ChatbotIcon className="w-6 h-6" />
        Connect Your AI Agent
      </h3>
      <p className="text-gray-700 mb-5">Use any of the following methods to connect an AI agent to this live session:</p>

      {/* Method 1: Direct Connection Parameters */}
      <div className="mb-5 p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 1: Direct Connection Parameters</h4>
        <p className="text-sm text-gray-600 mb-3">Use these values for platforms that require manual configuration:</p>
        
        <div className="mb-3">
          <label className="font-semibold text-gray-700 text-sm">MCP Endpoint URL:</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              readOnly
              value={connectionData?.mcpEndpoint || ''}
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(connectionData.mcpEndpoint, 'url')}
              className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
            >
              {copiedField === 'url' ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="font-semibold text-gray-700 text-sm">API Key:</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              readOnly
              value={connectionData?.userApiKey || ''}
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(connectionData.userApiKey, 'key')}
              className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
            >
              {copiedField === 'key' ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Method 2: JSON Configuration for Cursor */}
      <div className="mb-5 p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 2: JSON Configuration for Cursor</h4>
        <p className="text-sm text-gray-600 mb-3">Add to your Cursor MCP settings file:</p>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
          {cursorConfigJson}
        </pre>
        <button
          onClick={() => copyToClipboard(cursorConfigJson, 'cursor-json')}
          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
        >
          {copiedField === 'cursor-json' ? 'Copied!' : 'Copy Cursor Configuration'}
        </button>
      </div>

      {/* Method 3: JSON Configuration for Claude Desktop */}
      <div className="mb-5 p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 3: JSON Configuration for Claude Desktop</h4>
        <p className="text-sm text-gray-600 mb-3">Add to your Claude Desktop MCP settings file:</p>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
          {claudeDesktopConfigJson}
        </pre>
        <button
          onClick={() => copyToClipboard(claudeDesktopConfigJson, 'claude-json')}
          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
        >
          {copiedField === 'claude-json' ? 'Copied!' : 'Copy Claude Desktop Configuration'}
        </button>
      </div>

      {/* Method 4: Claude Code */}
      <div className="p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 4: Claude Code</h4>
        <p className="text-sm text-gray-600 mb-3">For Claude Code users, run this command:</p>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
          {cliCommand}
        </pre>
        <button
          onClick={() => copyToClipboard(cliCommand, 'cli')}
          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
        >
          {copiedField === 'cli' ? 'Copied!' : 'Copy CLI Command'}
        </button>
      </div>
    </div>
  );
}