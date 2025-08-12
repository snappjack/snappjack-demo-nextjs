export interface GameState {
  diceValues: (number | null)[];
  keptDice: boolean[];
  isRolling: boolean;
}

export interface DiceState {
  values: (number | null)[];
  nextActions: ('keep' | 'roll')[];
}

export interface DieProps {
  value: number | null;
  isKept: boolean;
  isRolling: boolean;
  index: number;
  onClick: (index: number) => void;
}

export interface GameControlsProps {
  onRoll: () => void;
  onReset: () => void;
  onKeepAll: () => void;
  onClearKeep: () => void;
  isRollDisabled: boolean;
  isRolling: boolean;
}

export interface GameStatusProps {
  diceValues: (number | null)[];
  keptDice: boolean[];
}

export interface ConnectionStatusProps {
  status: 'disconnected' | 'connected' | 'bridged';
}

export interface AgentConfigProps {
  connectionData: {
    userApiKey: string;
    appId: string;
    userId: string;
    mcpEndpoint: string;
  } | null;
}