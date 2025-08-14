import { useState, useEffect, useCallback, useRef } from 'react';
// import { Snappjack, ConnectionData, SnappjackStatus, Tool, ToolResponse, ToolHandler } from '@/lib/snappjack-client';
import { Snappjack, ConnectionData, SnappjackStatus, Tool, ToolResponse, ToolHandler } from '@snappjack/sdk-js';
import { GameState, DiceState } from '@/types/dice';

const appId = process.env.NEXT_PUBLIC_SNAPPJACK_APP_ID;
const apiKey = process.env.NEXT_PUBLIC_SNAPPJACK_API_KEY;
const serverUrl = process.env.NEXT_PUBLIC_SNAPPJACK_SERVER_URL;

// appId and apiKey must be defined,but serverUrl is optional
if (!appId || !apiKey) {
  throw new Error('Missing required environment variables');
}

interface SnappjackHookProps {
  getCurrentDiceState: () => DiceState;
  setDicePlan: (actions: string[]) => DiceState;
  performRoll: () => Promise<(number | null)[]>;
  resetGame: () => GameState;
}

export const useSnappjack = ({ 
  getCurrentDiceState, 
  setDicePlan, 
  performRoll, 
  resetGame 
}: SnappjackHookProps) => {
  const [status, setStatus] = useState<SnappjackStatus>('disconnected');
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  // Use refs to maintain stable references to handlers while allowing access to latest props
  const handlersRef = useRef<{
    handleAgentSystemInfoGet: ToolHandler;
    handleAgentDicePlan: ToolHandler;
    handleAgentDiceRoll: ToolHandler;
    handleAgentDiceReset: ToolHandler;
  }>({
    handleAgentSystemInfoGet: async () => ({ content: [] }),
    handleAgentDicePlan: async () => ({ content: [] }),
    handleAgentDiceRoll: async () => ({ content: [] }),
    handleAgentDiceReset: async () => ({ content: [] }),
  });

  // Update handlers in ref to use latest props
  handlersRef.current.handleAgentSystemInfoGet = useCallback(async (): Promise<ToolResponse> => {
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

  handlersRef.current.handleAgentDicePlan = useCallback(async (args: unknown): Promise<ToolResponse> => {
    const { actions } = args as { actions: string[] };
    const newStateForTool = setDicePlan(actions);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(newStateForTool)
      }]
    };
  }, [setDicePlan]);

  handlersRef.current.handleAgentDiceRoll = useCallback(async (): Promise<ToolResponse> => {
    const newDiceValues = await performRoll();
    const currentState = getCurrentDiceState();
    
    const newStateForTool: DiceState = {
        values: newDiceValues,
        nextActions: currentState.nextActions
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(newStateForTool)
      }]
    };
  }, [performRoll, getCurrentDiceState]);

  handlersRef.current.handleAgentDiceReset = useCallback(async (): Promise<ToolResponse> => {
    const newState = resetGame();
    
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
  }, [resetGame]);

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
        handler: (args, msg) => handlersRef.current.handleAgentSystemInfoGet(args, msg)
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
        handler: (args, msg) => handlersRef.current.handleAgentDicePlan(args, msg)
      },
      {
        name: 'pipster.dice.reset',
        description: 'Reset all dice. Clears values and sets all dice to roll.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleAgentDiceReset(args, msg)
      },
      {
        name: 'pipster.dice.roll',
        description: 'Roll all dice not marked as "keep".',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: (args, msg) => handlersRef.current.handleAgentDiceRoll(args, msg)
      }
    ];

    const snappjack = new Snappjack({
      userId: 'demo-user',
      appId,
      apiKey,
      serverUrl,
      tools: tools,
      autoReconnect: true
    });

    setAvailableTools(tools);

    snappjack.on('status', (newStatus: SnappjackStatus) => {
      setStatus(newStatus);
    });

    snappjack.on('user-api-key-generated', (data: ConnectionData) => {
      setConnectionData(data);
      console.log('Pipster demo app connected via Snappjack!');
    });

    snappjack.connect().catch((error: Error) => {
      console.error('Connection failed:', error);
    });

    return () => {
      snappjack.removeAllListeners();
      snappjack.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  return {
    status,
    connectionData,
    availableTools
  };
};