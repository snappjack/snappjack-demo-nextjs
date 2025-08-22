'use client';

import { CreationMode } from '@/app/drawit/types/drawit';

interface CanvasToolbarProps {
  currentMode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  onFinishPolygon: () => void;
  onCancelCreation: () => void;
  polygonVertexCount: number;
  strokeColor: string;
  fillColor: string;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
}

export default function CanvasToolbar({
  currentMode,
  onModeChange,
  onFinishPolygon,
  onCancelCreation,
  polygonVertexCount,
  strokeColor,
  fillColor,
  onStrokeColorChange,
  onFillColorChange
}: CanvasToolbarProps) {
  const tools = [
    { 
      id: 'none', 
      icon: '👆', 
      title: 'Select' 
    },
    { 
      id: 'rectangle', 
      icon: '⬜', 
      title: 'Rectangle' 
    },
    { 
      id: 'circle', 
      icon: '⭕', 
      title: 'Circle' 
    },
    { 
      id: 'text', 
      icon: '📝', 
      title: 'Text' 
    },
    { 
      id: 'polygon', 
      icon: '🔶', 
      title: 'Polygon' 
    },
  ] as const;

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-3">
        {/* Creation tools */}
        <div className="flex items-center gap-2">
          {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onModeChange(tool.id as CreationMode)}
            className={`
              relative group p-2 rounded transition-all duration-200
              ${currentMode === tool.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <span className="text-lg">{tool.icon}</span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {tool.title}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
          ))}
        </div>
        
        {/* Color pickers */}
        <div className="flex items-center gap-2 border-l border-gray-300 pl-3">
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Stroke:</label>
            <div className="relative group">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer bg-white"
                title="Stroke Color"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Stroke Color
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-600">Fill:</label>
            <div className="relative group">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer bg-white"
                title="Fill Color"
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Fill Color
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Polygon completion controls */}
      {currentMode === 'polygon' && polygonVertexCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {polygonVertexCount} vertices
          </span>
          <button
            onClick={onFinishPolygon}
            disabled={polygonVertexCount < 3}
            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Finish polygon (minimum 3 vertices required)"
          >
            Finish
          </button>
          <button
            onClick={onCancelCreation}
            className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            title="Cancel polygon creation"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Other creation mode feedback */}
      {currentMode !== 'none' && currentMode !== 'polygon' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {currentMode === 'text' ? 'Click to place text' : 'Click and drag to create'}
          </span>
          <button
            onClick={onCancelCreation}
            className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            title="Cancel creation"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}