'use client';

import { useMemo } from 'react';
import { useDrawit } from './hooks/useDrawit';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { useFileOperations } from './hooks/useFileOperations';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useSnappjackConnection, useSnappjackCredentials } from '@/lib/snappjack-react';
import { createSnappjackTools } from './lib/createSnappjackTools';
import { useSetConnectionStatus } from '@/contexts/ConnectionStatusContext';
import { CanvasObject } from './types/drawit';
import Canvas from './components/Canvas';
import CanvasToolbar from './components/CanvasToolbar';
import { SnappjackConnectionError } from '@/components/snappjack/SnappjackConnectionError';

export default function DrawItPage() {
  const APP_NAME = 'DrawIt';
  const APP_EMOJI = '🎨'; // Keep for logs

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

  // Credential management
  const { credentials, isLoadingCredentials, connectionError, resetCredentials, setConnectionError } = useSnappjackCredentials({
    appName: APP_NAME,
    snappId: process.env.NEXT_PUBLIC_DRAWIT_SNAPP_ID!
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
  }, [addRectangle, addCircle, addText, addPolygon, modifyObject, deleteObject, reorderObject, clearCanvas, getCanvasStatus, getCanvasImage]);

  // Snappjack connection management
  const { status, connectionData, availableTools } = useSnappjackConnection({
    credentials,
    isLoadingCredentials,
    snappId: process.env.NEXT_PUBLIC_DRAWIT_SNAPP_ID!,
    tools: snappjackTools,
    onConnectionError: setConnectionError
  });

  // Update header connection status
  useSetConnectionStatus(status, APP_NAME, connectionData, availableTools);

  // Create wrapper function for updating selected object from toolbar
  const handleUpdateSelectedObject = (updates: Partial<CanvasObject>) => {
    if (drawingState.selectedObject) {
      modifyObject(drawingState.selectedObject.id, updates);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] z-50">
      {/* Fixed Toolbar directly below header */}
      <div className="bg-white border-b border-gray-200 py-3 shadow-sm">
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
        <div className="bg-red-50 border border-red-200 p-4">
          <SnappjackConnectionError
            error={connectionError}
            onResetCredentials={resetCredentials}
          />
        </div>
      )}


      {/* Main Canvas Area - takes remaining space */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden">
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