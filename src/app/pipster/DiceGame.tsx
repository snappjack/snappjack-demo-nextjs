'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import DiceContainer from './DiceContainer';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import ConnectionStatus from '@/components/ConnectionStatus';
import AgentConfig from '@/components/AgentConfig';
import AvailableTools from '@/components/AvailableTools';
import { GameState, DiceState } from '@/types/dice';
import { Snappjack, ConnectionData, SnappjackStatus, Tool, ToolResponse, ToolHandler } from '@/lib/snappjack-client';

export default function DiceGame() {
  const [gameState, setGameState] = useState<GameState>({
    diceValues: [null, null, null, null, null],
    keptDice: [false, false, false, false, false],
    isRolling: false
  });

  const [rollingIndices, setRollingIndices] = useState<number[]>([]);
  const [snappjackStatus, setSnappjackStatus] = useState<SnappjackStatus>('disconnected');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  // Create ref to hold current game state to avoid stale closures in tool handlers
  const gameStateRef = useRef(gameState);
  
  // Update ref on every render
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Get current dice state for Snappjack tools
  const getCurrentDiceState = useCallback((): DiceState => {
    const currentState = gameStateRef.current;
    const values = currentState.diceValues.map(v => v === null ? null : v);
    const nextActions = currentState.keptDice.map(kept => kept ? 'keep' : 'roll') as ('keep' | 'roll')[];
    return { values, nextActions };
  }, []);

  // Handle dice click (user action)
  const handleUserDieClick = (index: number) => {
    if (gameState.isRolling || gameState.diceValues[index] === null) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: prev.keptDice.map((kept, i) => i === index ? !kept : kept)
    }));
  };

  // Keep all dice (user action)
  const handleUserKeepAll = () => {
    if (gameState.isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: prev.diceValues.map(v => v !== null)
    }));
  };

  // Clear all kept dice (user action)
  const handleUserClearKeep = () => {
    if (gameState.isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: [false, false, false, false, false]
    }));
  };

  // Perform dice roll - returns complete new dice state
  const performRoll = useCallback(async (): Promise<(number | null)[]> => {
    const currentState = gameStateRef.current;
    const indicesToRoll = currentState.keptDice
      .map((kept, index) => kept ? null : index)
      .filter((index): index is number => index !== null);
    
    if (indicesToRoll.length === 0) {
      throw new Error('Cannot roll - all dice are kept! Use pipster.dice.plan to change at least one die to "roll".');
    }

    return new Promise((resolve) => {
      setGameState(prev => ({ ...prev, isRolling: true }));
      setRollingIndices(indicesToRoll);

      const newValues = indicesToRoll.map(() => Math.floor(Math.random() * 6) + 1);

      // Simulate rolling animation
      setTimeout(() => {
        const finalDiceValues = [...currentState.diceValues];
        indicesToRoll.forEach((index, i) => {
          finalDiceValues[index] = newValues[i];
        });
        
        setGameState(prev => ({
          ...prev,
          diceValues: finalDiceValues,
          isRolling: false
        }));
        
        setRollingIndices([]);
        resolve(finalDiceValues);
      }, 500);
    });
  }, []);

  // Roll dice (user action)
  const handleUserDiceRoll = async () => {
    if (gameState.isRolling) return;
    try {
      await performRoll();
    } catch {
      // All dice are kept, nothing to roll
      return;
    }
  };

  // Reset game (user action)
  const handleUserDiceReset = useCallback((): GameState => {
    const currentState = gameStateRef.current;
    if (currentState.isRolling) {
      throw new Error('Cannot reset - dice are still rolling!');
    }
    const newState: GameState = {
      diceValues: [null, null, null, null, null],
      keptDice: [false, false, false, false, false],
      isRolling: false
    };
    setGameState(newState);
    return newState;
  }, []);

  // Agent tool handlers
  const handleAgentSystemInfoGet: ToolHandler = useCallback(async (): Promise<ToolResponse> => {
    const currentState = getCurrentDiceState();
    
    const systemDoc = `PIPSTER DICE SYSTEM

System Overview:
This system manages 5 dice (indexed 0-4). Each die can be individually controlled for keeping or rolling.

Current State Structure:
{values: [array of 5], nextAction: [array of 5]}
- values: Die face values (1-6) or null if not yet rolled
- nextAction: Planned action per die ("keep" or "roll")

Operating Instructions:
1. Check current state using this tool (pipster.systemInfo.get)
2. To change which dice to keep/roll: call pipster.dice.plan with array of 5 actions
   - Only call plan if you want to CHANGE the current nextAction state
   - Example: ["keep", "keep", "roll", "roll", "roll"] keeps first two dice
3. To execute a roll: call pipster.dice.roll
   - This rolls all dice marked as "roll" in nextAction
   - Kept dice retain their values
4. To start fresh: call pipster.dice.reset (sets all values to null)

Important Rules:
- Dice with null values MUST have nextAction set to "roll"
- Cannot keep a die that hasn't been rolled yet
- The nextAction state persists between calls until explicitly changed
- You don't need to call plan before every roll - only when changing strategy`;
    
    const message = systemDoc + '\n\nCurrent system state: ' + JSON.stringify(currentState);
    return {
      content: [{
        type: 'text',
        text: message
      }]
    };
  }, [getCurrentDiceState]);

  const handleAgentDicePlan: ToolHandler = useCallback(async (args: {actions: string[]}): Promise<ToolResponse> => {
    const {actions} = args;
    if (!Array.isArray(actions)) {
      throw new Error('the input actions parameter must be an array');
    }
    if (actions.length !== 5) {
      throw new Error('the input actions array must contain exactly 5 elements, one for each die');
    }
    const invalidActions = actions.filter(action => action !== 'keep' && action !== 'roll');
    if (invalidActions.length > 0) {
      throw new Error(`Invalid input actions in actions array: ${invalidActions.join(', ')}. Must be "keep" or "roll".`);
    }

    const currentState = gameStateRef.current;
    const newKeptDice = actions.map((action, i) => 
        action === 'keep' && currentState.diceValues[i] !== null
    );

    // Now, set the state with the pre-calculated value.
    setGameState(prev => ({
      ...prev,
      keptDice: newKeptDice
    }));
    
    // Construct the return object using the calculated state. No waiting!
    const newStateForTool: DiceState = {
        values: currentState.diceValues, // Values don't change on plan
        nextActions: actions as ('keep' | 'roll')[]
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(newStateForTool)
      }]
    };
  }, []);

  const handleAgentDiceRoll: ToolHandler = useCallback(async (): Promise<ToolResponse> => {
    const currentState = gameStateRef.current;
    
    // performRoll now returns the complete new dice state
    const newDiceValues = await performRoll();
    
    const newStateForTool: DiceState = {
        values: newDiceValues,
        nextActions: currentState.keptDice.map(kept => kept ? 'keep' : 'roll') as ('keep' | 'roll')[]
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(newStateForTool)
      }]
    };
  }, [performRoll]);

  const handleAgentDiceReset: ToolHandler = useCallback(async (): Promise<ToolResponse> => {
    const newState = handleUserDiceReset();
    
    // The resulting state is known, so we can construct it directly.
    const newStateForTool: DiceState = {
        values: newState.diceValues,
        nextActions: newState.keptDice.map(kept => kept ? 'keep' : 'roll') as ('keep' | 'roll')[]
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(newStateForTool)
      }]
    };
  }, [handleUserDiceReset]);
  
  // Initialize Snappjack
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tools: Tool[] = [
      {
        name: 'pipster.systemInfo.get',
        description: 'MUST call this exactly once before calling other tools to get system documentation and current state.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: handleAgentSystemInfoGet
      },
      {
        name: 'pipster.dice.plan',
        description: 'Set the plan for each die. Pass array of 5 actions ("keep" or "roll").',
        inputSchema: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              items: { type: 'string', enum: ['keep', 'roll'] },
              minItems: 5,
              maxItems: 5,
              description: 'Array of 5 actions, one for each die ("keep" or "roll")'
            }
          },
          required: ['actions']
        },
        handler: handleAgentDicePlan
      },
      {
        name: 'pipster.dice.reset',
        description: 'Reset all dice. Clears values and sets all dice to roll.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: handleAgentDiceReset
      },
      {
        name: 'pipster.dice.roll',
        description: 'Roll all dice not marked as "keep".',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: handleAgentDiceRoll
      }
    ];

    const appId = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID;
    const apiKey = process.env.NEXT_PUBLIC_SNAPPJACK_API_KEY;
    const serverUrl = process.env.NEXT_PUBLIC_SNAPPJACK_SERVER_URL;

    if (!appId || !apiKey) {
      throw new Error('Missing required environment variables');
    }

    const snappjack = new Snappjack({
      userId: 'demo-user',
      appId,
      apiKey,
      serverUrl,
      tools: tools,
      autoReconnect: true
    });

    // Store tools for the AvailableTools component
    setAvailableTools(tools);

    // Set up event listeners
    snappjack.on('status', (event: Event) => {
      const customEvent = event as CustomEvent;
      const newStatus = customEvent.detail as SnappjackStatus;
      setSnappjackStatus(newStatus);
    });

    snappjack.on('user-api-key-generated', (event: Event) => {
      const customEvent = event as CustomEvent;
      const data = customEvent.detail as ConnectionData;
      setConnectionData(data);
      console.log('Pipster demo app connected via Snappjack!');
    });

    // Connect to Snappjack
    snappjack.connect().catch((error: Error) => {
      console.error('Connection failed:', error);
    });

    // Cleanup on unmount
    return () => {
      snappjack.disconnect();
    };
  }, [
    handleAgentSystemInfoGet,
    handleAgentDicePlan,
    handleAgentDiceReset,
    handleAgentDiceRoll
  ]); // Add the memoized handlers to the dependency array

  const isRollDisabled = gameState.keptDice.filter(kept => kept).length === 5;

  return (
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

        <GameStatus diceValues={gameState.diceValues} keptDice={gameState.keptDice} />
        
        <DiceContainer
          diceValues={gameState.diceValues}
          keptDice={gameState.keptDice}
          isRolling={gameState.isRolling}
          rollingIndices={rollingIndices}
          onDieClick={handleUserDieClick}
        />

        <GameControls
          onRoll={handleUserDiceRoll}
          onReset={handleUserDiceReset}
          onKeepAll={handleUserKeepAll}
          onClearKeep={handleUserClearKeep}
          isRollDisabled={isRollDisabled}
          isRolling={gameState.isRolling}
        />
      </div>

      {/* Connection Status */}
      <ConnectionStatus status={snappjackStatus} />

      {/* Available Tools - only show when agent is connected (bridged) */}
      {snappjackStatus === 'bridged' && <AvailableTools tools={availableTools} />}

      {/* Agent Configuration */}
      <AgentConfig connectionData={connectionData} />

      {/* Learn More */}
      <div className="text-center mt-8 pt-5 border-t border-gray-200">
        <a href="https://www.snappjack.com" target="_blank" rel="noopener" className="text-blue-500 hover:underline font-medium text-lg">
          🔗 Learn more about Snappjack
        </a>
      </div>
    </div>
  );
}