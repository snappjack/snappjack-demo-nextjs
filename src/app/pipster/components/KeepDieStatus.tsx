'use client';

import { GameStatusProps } from '@/app/pipster/types/pipster';

export default function KeepDieStatus({ diceValues, keptDice }: GameStatusProps) {
  const keptCount = keptDice.filter(kept => kept).length;
  const rollingCount = 5 - keptCount;
  const allNull = diceValues.every(v => v === null);

  let statusText = '';
  if (allNull) {
    statusText = "Roll the dice to begin!";
  } else if (keptCount === 5) {
    statusText = "All dice kept! Reset to roll again.";
  } else if (keptCount === 0) {
    statusText = "Click dice to keep them, then roll the rest!";
  } else {
    statusText = `${keptCount} dice kept, ${rollingCount} will be rolled.`;
  }

  return (
    <div className="text-center mb-5 p-4 bg-gray-50 rounded-lg">
      <div className="text-lg font-medium text-gray-700">
        {statusText}
      </div>
    </div>
  );
}