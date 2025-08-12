'use client';

import { GameControlsProps } from '@/types/dice';

export default function GameControls({
  onRoll,
  onReset,
  onKeepAll,
  onClearKeep,
  isRollDisabled,
  isRolling
}: GameControlsProps) {
  return (
    <div className="flex justify-center gap-4 my-8 flex-wrap">
      <button
        onClick={onKeepAll}
        disabled={isRolling}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Keep All
      </button>
      <button
        onClick={onClearKeep}
        disabled={isRolling}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Clear Kept
      </button>
      <button
        onClick={onRoll}
        disabled={isRollDisabled || isRolling}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Roll Dice
      </button>
      <button
        onClick={onReset}
        disabled={isRolling}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Reset
      </button>
    </div>
  );
}