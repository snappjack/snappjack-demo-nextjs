'use client';

import { Tool } from '@snappjack/sdk-js';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface SnappjackAvailableToolsProps {
  tools: Tool[];
}

export function SnappjackAvailableTools({ tools }: SnappjackAvailableToolsProps) {
  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
      <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
        <WrenchScrewdriverIcon className="w-6 h-6" />
        Tools Published via Snappjack for AI Agents
      </h3>
      <p className="mb-4 text-gray-700">Your AI agent now has access to the following tools:</p>
      <table className="w-full text-gray-700">
        <tbody>
          {tools.map((tool) => (
            <tr key={tool.name} className="align-top">
              <td className="pr-4 py-1">
                <code className="bg-blue-100 px-2 py-1 rounded text-sm whitespace-nowrap">{tool.name}</code>
              </td>
              <td className="py-1">
                {tool.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}