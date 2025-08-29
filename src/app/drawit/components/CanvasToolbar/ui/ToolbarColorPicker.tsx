'use client';

import React from 'react';

interface ToolbarColorPickerProps {
  icon: React.ReactNode;
  value: string;
  onChange: (color: string) => void;
  tooltip: string;
  title?: string;
}

export default function ToolbarColorPicker({
  icon,
  value,
  onChange,
  tooltip,
  title
}: ToolbarColorPickerProps) {
  return (
    <div className="relative group">
      <button className="p-1.5 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex flex-col items-center justify-center">
        <div className="flex flex-col items-center w-6">
          <div className="w-6 h-4">
            {icon}
          </div>
          <div 
            className="w-6 h-1.5 mt-0.5 rounded-sm border border-gray-300"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="opacity-0 absolute inset-0 cursor-pointer"
          title={title || tooltip}
        />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {tooltip}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
}