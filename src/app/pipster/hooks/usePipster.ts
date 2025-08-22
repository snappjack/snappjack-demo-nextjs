import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, DiceState } from '@/app/pipster/types/pipster';

export const usePipster = () => {
  const [gameState, setGameState] = useState<GameState>({
    diceValues: [null, null, null, null, null],
    keptDice: [false, false, false, false, false],
    isRolling: false,
  });
  const [rollingIndices, setRollingIndices] = useState<number[]>([]);

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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

  const toggleDieKeep = useCallback((index: number) => {
    if (gameState.isRolling || gameState.diceValues[index] === null) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: prev.keptDice.map((kept, i) => i === index ? !kept : kept)
    }));
  }, [gameState.isRolling, gameState.diceValues]);

  const keepAll = useCallback(() => {
    if (gameState.isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: prev.diceValues.map(v => v !== null)
    }));
  }, [gameState.isRolling]);

  const clearKeep = useCallback(() => {
    if (gameState.isRolling) return;
    
    setGameState(prev => ({
      ...prev,
      keptDice: [false, false, false, false, false]
    }));
  }, [gameState.isRolling]);

  const rollDice = useCallback(async () => {
    if (gameState.isRolling) return;
    try {
      await performRoll();
    } catch {
      // All dice are kept, nothing to roll
      return;
    }
  }, [gameState.isRolling, performRoll]);

  const resetGame = useCallback((): GameState => {
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

  const setDicePlan = useCallback((actions: string[]): DiceState => {
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

    setGameState(prev => ({
      ...prev,
      keptDice: newKeptDice
    }));
    
    const newStateForTool: DiceState = {
        values: currentState.diceValues,
        nextActions: actions as ('keep' | 'roll')[]
    };

    return newStateForTool;
  }, []);

  const getCurrentDiceState = useCallback((): DiceState => {
    const currentState = gameStateRef.current;
    const values = currentState.diceValues.map(v => v === null ? null : v);
    const nextActions = currentState.keptDice.map(kept => kept ? 'keep' : 'roll') as ('keep' | 'roll')[];
    return { values, nextActions };
  }, []);

  return {
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
  };
};