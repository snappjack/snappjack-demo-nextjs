'use client';

import { useMemo } from 'react';
import { useDrawit } from './hooks/useDrawit';
import { PaintBrushIcon } from '@heroicons/react/24/outline';
import { useFileOperations } from './hooks/useFileOperations';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useSnappjackConnection } from '@/hooks/useSnappjackConnection';
import { useSnappjackCredentials } from '@/hooks/useSnappjackCredentials';
import { createSnappjackTools } from './lib/createSnappjackTools';
import { useSetConnectionStatus } from '@/contexts/ConnectionStatusContext';
import Canvas from './components/Canvas';
import ObjectList from './components/ObjectList';
import CanvasToolbar from './components/CanvasToolbar';
import PropertiesPanel from './components/PropertiesPanel';
import { SnappjackConnectionStatus } from '@/components/snappjack/SnappjackConnectionStatus';
import { SnappjackAgentConfig } from '@/components/snappjack/SnappjackAgentConfig';
import { SnappjackConnectionError } from '@/components/snappjack/SnappjackConnectionError';
import { SnappjackAvailableTools } from '@/components/snappjack/SnappjackAvailableTools';

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
    setDefaultStrokeColor,
    setDefaultFillColor,
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

  return (
    <div className="bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-5">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Snappjack Demo App
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 flex items-center justify-center gap-2">
            <PaintBrushIcon className="w-8 h-8" />
            {APP_NAME} - Agentic Canvas
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A canvas drawing app demonstrating how AI agents can create and manipulate visual content through{' '}
            <a href="https://www.snappjack.com" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
              Snappjack
            </a>
            . Agents can draw shapes, add text, and compose complex scenes using MCP tools.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Canvas Toolbar */}
              <CanvasToolbar
                currentMode={drawingState.creationMode}
                onModeChange={setCreationMode}
                onFinishPolygon={finishPolygon}
                onCancelCreation={cancelCreation}
                polygonVertexCount={drawingState.polygonVertices.length}
                strokeColor={defaultStrokeColor}
                fillColor={defaultFillColor}
                onStrokeColorChange={setDefaultStrokeColor}
                onFillColorChange={setDefaultFillColor}
              />
              
              <div className="flex justify-center mt-4">
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
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Object List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Objects</h2>
              <ObjectList
                objects={drawingState.objects}
                selectedObjectId={drawingState.selectedObject?.id || null}
                onSelectObject={selectObject}
                onDeleteObject={deleteObject}
                onReorderObject={reorderObject}
                onClearAll={clearCanvas}
                onSave={saveCanvas}
                onLoad={loadCanvas}
              />
            </div>

            {/* Properties Panel */}
            <PropertiesPanel
              selectedObject={drawingState.selectedObject}
              onUpdateObject={modifyObject}
            />
          </div>
        </div>

        {/* Full Width Bottom Section */}
        <div className="space-y-5 mt-5">
          {/* Connection Error */}
          {connectionError && (
            <SnappjackConnectionError 
              error={connectionError} 
              onResetCredentials={resetCredentials} 
            />
          )}

          {/* Connection Status */}
          <SnappjackConnectionStatus 
            status={status} 
            appName={APP_NAME} 
            appEmoji={APP_EMOJI}
            appIcon={<PaintBrushIcon className="w-10 h-10 text-blue-600" />}
          />

          {/* Available Tools - only show when agent is connected */}
          {status === 'bridged' && <SnappjackAvailableTools tools={availableTools} />}

          {/* Agent Configuration */}
          <SnappjackAgentConfig connectionData={connectionData} appName={APP_NAME.toLowerCase()} />
        </div>
      </div>
    </div>
  );
}