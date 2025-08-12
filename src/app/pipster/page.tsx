import { Metadata } from 'next';
import DiceGame from './DiceGame';

export const metadata: Metadata = {
  title: 'Pipster - Agentic Dice',
  description: 'A simple app demonstrating how web applications can provide both a traditional GUI for direct user interaction and expose functionality through the Snappjack SDK, enabling AI agents to connect to live sessions via the standard MCP protocol.',
};

export default function DicePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-5">
        <DiceGame />
      </div>
    </div>
  );
}