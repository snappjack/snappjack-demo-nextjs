'use client';

import { useToolbarContext } from '../ToolbarContext';

export default function CreationModeControlsGroup() {
  const {
    currentMode,
    polygonVertexCount,
    onFinishPolygon,
    onCancelCreation
  } = useToolbarContext();
  // Polygon completion controls
  if (currentMode === 'polygon' && polygonVertexCount > 0) {
    return (
      <>
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
      </>
    );
  }

  // Other creation mode feedback
  if (currentMode !== 'none' && currentMode !== 'polygon') {
    return (
      <>
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
      </>
    );
  }

  return null;
}