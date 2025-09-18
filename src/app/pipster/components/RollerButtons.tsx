'use client';

import { RollerButtonsProps } from '@/app/pipster/types/pipster';

export default function RollerButtons({
  onRoll,
  onReset,
  onKeepAll,
  onClearKeep,
  isRollDisabled,
  isRolling
}: RollerButtonsProps) {
  return (
    <div className="flex justify-center gap-4 my-8 flex-wrap">
      <button
        onClick={onKeepAll}
        disabled={isRolling}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:disabled:text-gray-500"
      >
        Keep All
      </button>
      <button
        onClick={onClearKeep}
        disabled={isRolling}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:disabled:text-gray-500"
      >
        Clear Kept
      </button>
      <button
        onClick={onRoll}
        disabled={isRollDisabled || isRolling}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:disabled:text-gray-500"
      >
        Roll Dice
      </button>
      <button
        onClick={onReset}
        disabled={isRolling}
        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed dark:disabled:text-gray-500"
      >
        Reset
      </button>
    </div>
  );
}