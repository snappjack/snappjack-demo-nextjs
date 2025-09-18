'use client';

import React from 'react';
import CanvasOperationsGroup from '../groups/CanvasOperationsGroup';
import CreationToolsGroup from '../groups/CreationToolsGroup';
import PropertyEditorsGroup from '../groups/PropertyEditorsGroup';
import ObjectManipulationGroup from '../groups/ObjectManipulationGroup';
import CreationModeControlsGroup from '../groups/CreationModeControlsGroup';
import { useToolbarContext } from '../ToolbarContext';

export default function HorizontalToolbarLayout() {
  const {
    // Canvas operations
    onSave,
    onLoad,
    onClearAll,
    // Creation tools
    currentMode,
    // Property editors
    selectedObject,
    // Object manipulation
    onDeleteObject,
    onReorderObject,
    // Creation mode controls
    polygonVertexCount
  } = useToolbarContext();

  return (
    <div className="flex flex-wrap items-center gap-3 max-w-7xl mx-auto px-5">
      {/* Canvas Operations section */}
      {(onSave || onLoad || onClearAll) && (
        <div className="flex items-center gap-1">
          <CanvasOperationsGroup />
        </div>
      )}

      {/* Creation tools section */}
      <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
        <CreationToolsGroup />
      </div>
      
      {/* Fill, Stroke, Stroke Width, and Make Default section */}
      <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
        <PropertyEditorsGroup />
      </div>

      {/* Object Manipulation Tools section */}
      {selectedObject && onDeleteObject && onReorderObject && (
        <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
          <ObjectManipulationGroup />
        </div>
      )}

      {/* Creation mode controls */}
      {((currentMode === 'polygon' && polygonVertexCount > 0) || 
        (currentMode !== 'none' && currentMode !== 'polygon')) && (
        <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
          <CreationModeControlsGroup />
        </div>
      )}
    </div>
  );
}