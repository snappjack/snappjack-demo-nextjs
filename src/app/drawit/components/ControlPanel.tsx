'use client';

interface ControlPanelProps {
  onClearCanvas: () => void;
  objectCount: number;
}

export default function ControlPanel({
  onClearCanvas,
  objectCount
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Controls</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Objects on canvas:</span>
          <span className="font-semibold">{objectCount}</span>
        </div>

        <button
          onClick={onClearCanvas}
          disabled={objectCount === 0}
          className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
}