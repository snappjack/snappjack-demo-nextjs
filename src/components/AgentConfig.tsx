'use client';

import { useState } from 'react';
import { AgentConfigProps } from '@/types/dice';

export default function AgentConfig({ connectionData }: AgentConfigProps) {
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

  const mcpConfig = {
    "pipster": {
      type: 'http',
      url: connectionData.mcpEndpoint,
      headers: { Authorization: `Bearer ${connectionData.userApiKey}` }
    }
  };

  const configJson = JSON.stringify(mcpConfig, null, 2);
  const cliCommand = `claude mcp add --transport http pipster ${connectionData.mcpEndpoint} \\
  --header "Authorization: Bearer ${connectionData.userApiKey}"`;

  return (
    <div className="mt-10 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
      <h3 className="text-xl font-bold text-blue-900 mb-4">🤖 Connect Your AI Agent</h3>
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
              value={connectionData.mcpEndpoint}
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(connectionData.mcpEndpoint, 'url')}
              className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
            >
              {copiedField === 'url' ? '✓' : '📋'}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="font-semibold text-gray-700 text-sm">API Key:</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              readOnly
              value={connectionData.userApiKey}
              className="flex-1 p-2 border border-gray-300 rounded text-sm font-mono bg-gray-50"
            />
            <button
              onClick={() => copyToClipboard(connectionData.userApiKey, 'key')}
              className="ml-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded transition-colors"
            >
              {copiedField === 'key' ? '✓' : '📋'}
            </button>
          </div>
        </div>
      </div>

      {/* Method 2: JSON Configuration */}
      <div className="mb-5 p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 2: JSON Configuration</h4>
        <p className="text-sm text-gray-600 mb-3">Add to your MCP settings file (Claude Desktop, Cursor, etc.):</p>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
          {configJson}
        </pre>
        <button
          onClick={() => copyToClipboard(configJson, 'json')}
          className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors"
        >
          {copiedField === 'json' ? 'Copied!' : 'Copy JSON Configuration'}
        </button>
      </div>

      {/* Method 3: Claude CLI */}
      <div className="p-4 bg-white rounded-md border border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-3">Method 3: Claude CLI</h4>
        <p className="text-sm text-gray-600 mb-3">For Claude CLI users, run this command:</p>
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