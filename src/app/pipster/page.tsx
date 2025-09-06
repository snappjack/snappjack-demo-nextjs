'use client';

import { useMemo, useEffect } from 'react';
import { usePipster } from './hooks/usePipster';
import { DiceIcon } from '@/components/icons/DiceIcon';
import { useSafeSnappjack } from '@/lib/snappjack/nextjs';
import { usePageConfig } from '@/contexts/PageConfigContext';
import { createSnappjackTools } from './lib/createSnappjackTools';
import DiceContainer from './components/DiceContainer';
import RollerButtons from './components/RollerButtons';
import KeepDieStatus from './components/KeepDieStatus';
import { SnappjackConnectionError } from '@/lib/snappjack/nextjs';

// Main component that registers Snappjack configuration and renders content
export default function DicePage() {
  const APP_NAME = 'Pipster';
  const { setConfig } = usePageConfig();
  
  // Dice game functionality
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

  // Create Snappjack tools from dice game API (memoized to prevent infinite re-renders)
  const snappjackTools = useMemo(() => {
    const diceGameAPI = {
      getCurrentDiceState,
      setDicePlan,
      performRoll,
      resetGame
    };
    return createSnappjackTools(diceGameAPI, APP_NAME);
  }, [getCurrentDiceState, setDicePlan, performRoll, resetGame, APP_NAME]);

  // Register page configuration with layout on mount
  useEffect(() => {
    setConfig({
      snappId: process.env.NEXT_PUBLIC_PIPSTER_SNAPP_ID!,
      appName: APP_NAME,
      tools: snappjackTools
    });

    // Cleanup configuration when component unmounts
    return () => setConfig(null);
  }, [setConfig, snappjackTools, APP_NAME]);

  const isRollDisabled = gameState.keptDice.filter(kept => kept).length === 5;

  // Get connection state from Snappjack context (if available)
  const { connectionError, resetCredentials } = useSafeSnappjack();

  return (
    <div className="bg-gray-100 min-h-0 flex-1 py-8">
      <div className="max-w-7xl mx-auto px-5">

        {/* Connection Error */}
        {connectionError && (
          <div className="mb-5">
            <SnappjackConnectionError 
              error={connectionError} 
              onResetCredentials={resetCredentials || (() => {})} 
            />
          </div>
        )}

      {/* Game Card */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Snappjack Demo App
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
            <DiceIcon className="w-8 h-8" />
            {APP_NAME} - Agentic Dice
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
        </div>
      </div>
    </div>
  );
}