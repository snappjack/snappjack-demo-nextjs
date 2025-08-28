'use client';

import React from 'react';

interface CornerRadiusEditorProps {
  value: number;
  onChange: (radius: number, close?: boolean) => void;
}

export default function CornerRadiusEditor({ 
  value, 
  onChange 
}: CornerRadiusEditorProps) {
  const presets = [0, 5, 10, 15, 30, 50];

  return (
    <div className="p-3 w-48">
      {/* Current value display */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Corner Radius: {value}%
        </label>
        
        {/* Slider */}
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full mb-2"
          min="0"
          max="50"
          step="1"
        />
        
        {/* Number input */}
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const numValue = Math.max(0, Math.min(50, parseInt(e.target.value) || 0));
              onChange(numValue);
            }}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
            min="0"
            max="50"
          />
          <span className="text-xs text-gray-600">%</span>
        </div>
      </div>
      
      {/* Preset buttons */}
      <div className="border-t border-gray-200 pt-2">
        <div className="text-xs text-gray-500 mb-1">Quick presets:</div>
        <div className="grid grid-cols-3 gap-1">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset, true)}
              className={`
                px-1 py-1 text-xs rounded transition-colors
                ${value === preset
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }
              `}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}