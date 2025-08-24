'use client';

import { useMemo } from 'react';
import { useDrawit } from './hooks/useDrawit';
import { useSnappjackConnection } from '@/hooks/useSnappjackConnection';
import { useSnappjackCredentials } from '@/hooks/useSnappjackCredentials';
import { createSnappjackTools } from './lib/createSnappjackTools';
import Canvas from './components/Canvas';
import ObjectList from './components/ObjectList';
import CanvasToolbar from './components/CanvasToolbar';
import PropertiesPanel from './components/PropertiesPanel';
import ConnectionStatus from '@/components/ConnectionStatus';
import AgentConfig from '@/components/AgentConfig';
import AvailableTools from '@/components/AvailableTools';

export default function DrawItPage() {
  const APP_NAME = 'DrawIt';
  const APP_EMOJI = '🎨';
  
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
    resizeObject,
    rotateObject,
    startHandleInteraction,
    endHandleInteraction,
    saveCanvas,
    loadCanvas,
    defaultStrokeColor,
    defaultFillColor,
    setDefaultStrokeColor,
    setDefaultFillColor,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  } = useDrawit(APP_NAME);

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
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            {APP_EMOJI} {APP_NAME} - Agentic Canvas
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
              <h2 className="text-xl font-semibold mb-4">Canvas</h2>
              
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
              
              <div className="flex justify-center">
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
                  onResizeObject={resizeObject}
                  onRotateObject={rotateObject}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 text-xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">Connection Problem</h3>
                  <p className="text-red-700 mb-3">{connectionError.message}</p>
                  {connectionError.canResetCredentials ? (
                    <div className="space-y-2">
                      <p className="text-red-600 text-sm">
                        Your credentials may be invalid. Try getting new credentials:
                      </p>
                      <button
                        onClick={resetCredentials}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Get New Credentials
                      </button>
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">
                      {connectionError.type === 'server_unreachable' 
                        ? 'The server may be down. Please wait and the app will retry automatically.' 
                        : 'Please check your connection and try refreshing the page.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Connection Status */}
          <ConnectionStatus status={status} appName={APP_NAME} appEmoji={APP_EMOJI} />

          {/* Available Tools - only show when agent is connected */}
          {status === 'bridged' && <AvailableTools tools={availableTools} />}

          {/* Agent Configuration */}
          <AgentConfig connectionData={connectionData} appName={APP_NAME.toLowerCase()} />
        </div>
      </div>
    </div>
  );
}