'use client';

import React from 'react';

interface StrokeWidthSelectorProps {
  value: number;
  options: number[];
  onChange: (width: number) => void;
}

export default function StrokeWidthSelector({ 
  value, 
  options, 
  onChange 
}: StrokeWidthSelectorProps) {
  return (
    <div>
      {options.map((width) => (
        <button
          key={width}
          onClick={() => onChange(width)}
          className={`
            w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${value === width ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
          `}
        >
          <div 
            className="bg-gray-800 dark:bg-gray-300 rounded-full"
            style={{
              width: `${Math.min(width * 1.5, 20)}px`,
              height: `${Math.min(width * 1.5, 20)}px`
            }}
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{width}px</span>
        </button>
      ))}
    </div>
  );
}