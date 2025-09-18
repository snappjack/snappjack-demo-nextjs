'use client';

import { DieProps } from '@/app/pipster/types/pipster';
import { CheckIcon } from '@heroicons/react/24/solid';

export default function Die({ value, isKept, isRolling, index, onClick }: DieProps) {
  const handleClick = () => {
    if (value !== null && !isRolling) {
      onClick(index);
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`
          w-20 h-20 border-[3px] rounded-lg
          flex items-center justify-center
          text-4xl font-bold bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100
          cursor-pointer transition-all duration-300
          select-none
          ${isRolling ? 'animate-dice-roll' : ''}
          ${isKept ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:scale-105'}
        `}
      >
        {value === null ? '-' : value}
      </div>
      {isKept && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
          <CheckIcon className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}