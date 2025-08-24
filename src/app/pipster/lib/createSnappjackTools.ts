import { Tool, ToolResponse } from '@snappjack/sdk-js';
import { GameState, DiceState } from '@/app/pipster/types/pipster';

interface DiceGameAPI {
  getCurrentDiceState: () => DiceState;
  setDicePlan: (actions: string[]) => DiceState;
  performRoll: () => Promise<(number | null)[]>;
  resetGame: () => GameState;
}

const getSystemDocumentation = (appName: string, currentState: DiceState): string => {
  const systemDoc = `${appName.toUpperCase()} DICE SYSTEM

System Overview:
This system manages 5 dice (indexed 0-4). Each die can be individually controlled for keeping or rolling.

Current State Structure:
{values: [array of 5], nextAction: [array of 5]}
- values: Die face values (1-6) or null if not yet rolled
- nextAction: Planned action per die ("keep" or "roll")

Operating Instructions:
1. Check current state using this tool (${appName.toLowerCase()}_systemInfo_get)
2. To change which dice to keep/roll: call ${appName.toLowerCase()}_dice_plan with array of 5 actions
   - Only call plan if you want to CHANGE the current nextAction state
   - Example: ["keep", "keep", "roll", "roll", "roll"] keeps first two dice
3. To execute a roll: call ${appName.toLowerCase()}_dice_roll
   - This rolls all dice marked as "roll" in nextAction
   - Kept dice retain their values
4. To start fresh: call ${appName.toLowerCase()}_dice_reset (sets all values to null)

Important Rules:
- Dice with null values MUST have nextAction set to "roll"
- Cannot keep a die that hasn't been rolled yet
- The nextAction state persists between calls until explicitly changed
- You don't need to call plan before every roll - only when changing strategy`;

  return systemDoc + '\n\nCurrent system state: ' + JSON.stringify(currentState);
};

export function createSnappjackTools(diceGameAPI: DiceGameAPI, appName: string): Tool[] {
  return [
    {
      name: `${appName.toLowerCase()}_systemInfo_get`,
      description: 'MUST call this exactly once before calling other tools to get system documentation and current state.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        const currentState = diceGameAPI.getCurrentDiceState();
        const message = getSystemDocumentation(appName, currentState);
        return {
          content: [{
            type: 'text',
            text: message
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_dice_plan`,
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
      handler: async (args: unknown): Promise<ToolResponse> => {
        const { actions } = args as { actions: string[] };
        const newStateForTool = diceGameAPI.setDicePlan(actions);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(newStateForTool)
          }]
        };
      }
    },
    {
      name: `${appName.toLowerCase()}_dice_roll`,
      description: 'Roll all dice not marked as "keep".',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        const newDiceValues = await diceGameAPI.performRoll();
        const currentState = diceGameAPI.getCurrentDiceState();
        
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
      }
    },
    {
      name: `${appName.toLowerCase()}_dice_reset`,
      description: 'Reset all dice. Clears values and sets all dice to roll.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      handler: async (): Promise<ToolResponse> => {
        const newState = diceGameAPI.resetGame();
        
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
      }
    }
  ];
}