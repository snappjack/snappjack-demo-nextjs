'use client';

import { useMemo, useEffect } from 'react';
import { useDrawit } from './hooks/useDrawit';
import { useFileOperations } from './hooks/useFileOperations';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useSafeSnappjack } from '@/lib/snappjack/nextjs';
import { usePageConfig } from '@/contexts/PageConfigContext';
import { createSnappjackTools } from './lib/createSnappjackTools';
import { CanvasObject } from './types/drawit';
import Canvas from './components/Canvas';
import CanvasToolbar from './components/CanvasToolbar';
import { SnappjackConnectionError } from '@/lib/snappjack/nextjs';

// Main component that registers Snappjack configuration and renders content
export default function DrawItPage() {
  const APP_NAME = 'DrawIt';
  const { setConfig } = usePageConfig();

  // Drawing functionality
  const {
    drawingState,
    canvasRef,
    addRectangle,
    addCircle,
    addText,
    addPolygon,
    modifyObject,
    deleteObject,
    reorderObject,
    clearCanvas,
    selectObject,
    moveObject,
    getCanvasStatus,
    getCanvasImage,
    setCreationMode,
    startCreation,
    updateCreation,
    finishCreation,
    addPolygonVertex,
    finishPolygon,
    cancelCreation,
    startHandleInteraction,
    endHandleInteraction,
    loadObjects,
    defaultStrokeColor,
    defaultFillColor,
    defaultStrokeWidth,
    setDefaultStrokeColor,
    setDefaultFillColor,
    setDefaultStrokeWidth,
    makeSelectedObjectDefaults,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  } = useDrawit();

  // File operations
  const { saveCanvas, loadCanvas } = useFileOperations({
    objects: drawingState.objects,
    appName: APP_NAME,
    onLoadObjects: loadObjects
  });

  // Canvas interactions
  const { resizeObject, rotateObject } = useCanvasInteraction({
    onUpdateObject: modifyObject
  });

  // Create Snappjack tools from drawing API (memoized to prevent infinite re-renders)
  const snappjackTools = useMemo(() => {
    const drawingAPI = {
      addRectangle,
      addCircle,
      addText,
      addPolygon,
      modifyObject,
      deleteObject,
      reorderObject,
      clearCanvas,
      getCanvasStatus,
      getCanvasImage
    };
    return createSnappjackTools(drawingAPI, APP_NAME);
  }, [addRectangle, addCircle, addText, addPolygon, modifyObject, deleteObject, reorderObject, clearCanvas, getCanvasStatus, getCanvasImage, APP_NAME]);

  // Register page configuration with layout on mount
  useEffect(() => {
    setConfig({
      snappId: process.env.NEXT_PUBLIC_DRAWIT_SNAPP_ID!,
      appName: APP_NAME,
      tools: snappjackTools
    });

    // Cleanup configuration when component unmounts
    return () => setConfig(null);
  }, [setConfig, snappjackTools, APP_NAME]);

  // Create wrapper function for updating selected object from toolbar
  const handleUpdateSelectedObject = (updates: Partial<CanvasObject>) => {
    if (drawingState.selectedObject) {
      modifyObject(drawingState.selectedObject.id, updates);
    }
  };

  // Get connection state from Snappjack context (if available)
  const { connectionError, resetCredentials } = useSafeSnappjack();

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] z-20">
      {/* Fixed Toolbar directly below header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 shadow-sm">
        <CanvasToolbar
          currentMode={drawingState.creationMode}
          onModeChange={setCreationMode}
          onFinishPolygon={finishPolygon}
          onCancelCreation={cancelCreation}
          polygonVertexCount={drawingState.polygonVertices.length}
          strokeColor={defaultStrokeColor}
          fillColor={defaultFillColor}
          strokeWidth={defaultStrokeWidth}
          onStrokeColorChange={setDefaultStrokeColor}
          onFillColorChange={setDefaultFillColor}
          onStrokeWidthChange={setDefaultStrokeWidth}
          selectedObject={drawingState.selectedObject}
          onUpdateSelectedObject={handleUpdateSelectedObject}
          onMakeSelectedObjectDefaults={makeSelectedObjectDefaults}
          onDeleteObject={deleteObject}
          onReorderObject={reorderObject}
          onSave={saveCanvas}
          onLoad={loadCanvas}
          onClearAll={clearCanvas}
        />
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 p-4">
          <SnappjackConnectionError
            error={connectionError}
            onResetCredentials={resetCredentials || (() => {})}
          />
        </div>
      )}

      {/* Main Canvas Area - takes remaining space */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        <Canvas
          ref={canvasRef}
          objects={drawingState.objects}
          selectedObject={drawingState.selectedObject}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          creationMode={drawingState.creationMode}
          isCreating={drawingState.isCreating}
          creationStart={drawingState.creationStart}
          polygonVertices={drawingState.polygonVertices}
          handleInteraction={drawingState.handleInteraction}
          onCanvasClick={() => selectObject(null)}
          onObjectClick={selectObject}
          onObjectDrag={moveObject}
          onStartCreation={startCreation}
          onFinishCreation={finishCreation}
          onUpdateCreation={updateCreation}
          onAddPolygonVertex={addPolygonVertex}
          onResizeObject={(id, handleType, newX, newY) => resizeObject(id, handleType, newX, newY, drawingState.handleInteraction)}
          onRotateObject={(id, mouseX, mouseY) => {
            const obj = drawingState.objects.find(o => o.id === id);
            if (obj) rotateObject(id, mouseX, mouseY, obj.x, obj.y);
          }}
          onStartHandleInteraction={startHandleInteraction}
          onEndHandleInteraction={endHandleInteraction}
          onUpdateSelectedObject={handleUpdateSelectedObject}
        />
      </div>
    </div>
  );
}