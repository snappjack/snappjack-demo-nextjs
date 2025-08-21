'use client';

import { usePipster } from './hooks/usePipster';
import { useSnappjack } from './hooks/useSnappjack';
import DiceContainer from './components/DiceContainer';
import RollerButtons from './components/RollerButtons';
import KeepDieStatus from './components/KeepDieStatus';
import ConnectionStatus from '@/components/ConnectionStatus';
import AgentConfig from '@/components/AgentConfig';
import AvailableTools from '@/components/AvailableTools';

export default function DicePage() {
  const {
    gameState,
    rollingIndices,
    toggleDieKeep,
    keepAll,
    clearKeep,
    rollDice,
    performRoll,
    resetGame,
    setDicePlan,
    getCurrentDiceState,
  } = usePipster();

  const { status, connectionData, availableTools, connectionError, resetCredentials } = useSnappjack({
    getCurrentDiceState,
    setDicePlan,
    performRoll,
    resetGame,
  });

  const isRollDisabled = gameState.keptDice.filter(kept => kept).length === 5;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-5">
        <div>
          {/* Header */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-5">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Snappjack Demo App
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              🎲 Pipster - Agentic Dice
            </h1>
            <p className="text-center text-gray-600 max-w-2xl mx-auto leading-relaxed">
              A simple app demonstrating how web applications can provide both a traditional GUI for
              direct user interaction and expose functionality through the{' '}
              <a href="https://www.snappjack.com" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
                Snappjack
              </a>{' '}
              SDK, enabling AI agents to connect to live sessions via the standard MCP protocol.
            </p>

            <KeepDieStatus diceValues={gameState.diceValues} keptDice={gameState.keptDice} />
            
            <DiceContainer
              diceValues={gameState.diceValues}
              keptDice={gameState.keptDice}
              isRolling={gameState.isRolling}
              rollingIndices={rollingIndices}
              onDieClick={toggleDieKeep}
            />

            <RollerButtons
              onRoll={rollDice}
              onReset={resetGame}
              onKeepAll={keepAll}
              onClearKeep={clearKeep}
              isRollDisabled={isRollDisabled}
              isRolling={gameState.isRolling}
            />
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Connection Problem</h3>
                  <p className="text-red-700 mb-3">{connectionError.message}</p>
                  {connectionError.canResetCredentials ? (
                    <div className="space-y-2">
                      <p className="text-red-600 text-sm">
                        Your credentials may be invalid. Try getting new credentials:
                      </p>
                      <button
                        onClick={resetCredentials}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Get New Credentials
                      </button>
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">
                      {connectionError.type === 'server_unreachable' 
                        ? 'The server may be down. Please wait and the app will retry automatically.' 
                        : 'Please check your connection and try refreshing the page.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <ConnectionStatus status={status} appName="Pipster" appEmoji="🎲" />

          {/* Available Tools - only show when agent is connected (bridged) */}
          {status === 'bridged' && <AvailableTools tools={availableTools} />}

          {/* Agent Configuration */}
          <AgentConfig connectionData={connectionData} />

          {/* Learn More */}
          <div className="text-center mt-8 pt-5 border-t border-gray-200">
            <a href="https://www.snappjack.com" target="_blank" rel="noopener" className="text-blue-500 hover:underline font-medium text-lg">
              🔗 Learn more about Snappjack
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}