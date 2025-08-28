'use client';

import React from 'react';
import { TextObject } from '@/app/drawit/types/drawit';

interface TextEditorProps {
  textObject: TextObject;
  onUpdate: (updates: Partial<TextObject>) => void;
}

export default function TextEditor({ 
  textObject, 
  onUpdate 
}: TextEditorProps) {
  const fontFamilyOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times' },
    { value: 'Courier New', label: 'Courier' },
    { value: 'Helvetica', label: 'Helvetica' }
  ];

  const fontWeightOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: 'lighter', label: 'Light' }
  ];

  return (
    <div className="p-3 w-64">
      {/* Text Content */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <textarea
          value={textObject.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          rows={2}
        />
      </div>

      {/* Font Size */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Font Size: {textObject.fontSize.toFixed(0)}%
        </label>
        <input
          type="range"
          value={textObject.fontSize}
          onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) })}
          className="w-full mb-2"
          min="1"
          max="50"
          step="1"
        />
      </div>

      {/* Font Family and Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={textObject.fontFamily || 'Arial'}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            {fontFamilyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Weight
          </label>
          <select
            value={textObject.fontWeight || 'normal'}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          >
            {fontWeightOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}