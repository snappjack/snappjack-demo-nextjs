'use client';

import React from 'react';
import CanvasOperationsGroup from '../groups/CanvasOperationsGroup';
import CreationToolsGroup from '../groups/CreationToolsGroup';
import PropertyEditorsGroup from '../groups/PropertyEditorsGroup';
import ObjectManipulationGroup from '../groups/ObjectManipulationGroup';
import CreationModeControlsGroup from '../groups/CreationModeControlsGroup';
import { useToolbarContext } from '../ToolbarContext';

export default function VerticalToolbarLayout() {
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
    <div className="flex flex-col items-stretch gap-3">
      {/* Canvas Operations section */}
      {(onSave || onLoad || onClearAll) && (
        <div className="flex flex-col gap-1">
          <CanvasOperationsGroup />
        </div>
      )}

      {/* Creation tools section */}
      <div className="flex flex-col gap-1 border-t border-gray-300 pt-3">
        <CreationToolsGroup />
      </div>
      
      {/* Fill, Stroke, Stroke Width, and Make Default section */}
      <div className="flex flex-col gap-1 border-t border-gray-300 pt-3">
        <PropertyEditorsGroup />
      </div>

      {/* Object Manipulation Tools section */}
      {selectedObject && onDeleteObject && onReorderObject && (
        <div className="flex flex-col gap-1 border-t border-gray-300 pt-3">
          <ObjectManipulationGroup />
        </div>
      )}

      {/* Creation mode controls */}
      {((currentMode === 'polygon' && polygonVertexCount > 0) || 
        (currentMode !== 'none' && currentMode !== 'polygon')) && (
        <div className="flex flex-col gap-1 border-t border-gray-300 pt-3">
          <CreationModeControlsGroup />
        </div>
      )}
    </div>
  );
}