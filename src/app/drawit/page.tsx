'use client';

import { useDrawit } from './hooks/useDrawit';
import { useSnappjack } from './hooks/useSnappjack';
import Canvas from './components/Canvas';
import ObjectList from './components/ObjectList';
import ControlPanel from './components/ControlPanel';
import ConnectionStatus from '@/components/ConnectionStatus';
import AgentConfig from '@/components/AgentConfig';
import AvailableTools from '@/components/AvailableTools';

export default function DrawItPage() {
  const {
    drawingState,
    getSystemInfo,
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
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  } = useDrawit();

  const { status, connectionData, availableTools } = useSnappjack({
    getSystemInfo,
    addRectangle,
    addCircle,
    addText,
    addPolygon,
    modifyObject,
    deleteObject,
    reorderObject,
    clearCanvas,
    getCanvasStatus
  });

  const handleCanvasClick = () => {
    selectObject(null);
  };

  const handleObjectClick = (id: string) => {
    selectObject(id);
  };

  const handleObjectDrag = (id: string, x: number, y: number) => {
    moveObject(id, x, y);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-5">
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-5">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Snappjack Demo App
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            🎨 DrawIt - Agentic Canvas
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
              <div className="flex justify-center">
                <Canvas
                  objects={drawingState.objects}
                  selectedObject={drawingState.selectedObject}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  onCanvasClick={handleCanvasClick}
                  onObjectClick={handleObjectClick}
                  onObjectDrag={handleObjectDrag}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-5">
            {/* Control Panel */}
            <ControlPanel
              onClearCanvas={clearCanvas}
              objectCount={drawingState.objects.length}
            />

            {/* Object List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Objects</h2>
              <ObjectList
                objects={drawingState.objects}
                selectedObjectId={drawingState.selectedObject?.id || null}
                onSelectObject={selectObject}
                onDeleteObject={deleteObject}
                onReorderObject={reorderObject}
              />
            </div>
          </div>
        </div>

        {/* Full Width Bottom Section */}
        <div className="space-y-5 mt-5">
          {/* Connection Status */}
          <ConnectionStatus status={status} appName="DrawIt" appEmoji="🎨" />

          {/* Available Tools - only show when agent is connected */}
          {status === 'bridged' && <AvailableTools tools={availableTools} />}

          {/* Agent Configuration */}
          <AgentConfig connectionData={connectionData} />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-5 border-t border-gray-200">
          <a href="https://www.snappjack.com" target="_blank" rel="noopener" className="text-blue-500 hover:underline font-medium text-lg">
            🔗 Learn more about Snappjack
          </a>
        </div>
      </div>
    </div>
  );
}