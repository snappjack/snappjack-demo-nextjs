'use client';

import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/types/drawit';

interface ObjectListProps {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onReorderObject: (id: string, operation: 'up' | 'down' | 'top' | 'bottom') => void;
}

export default function ObjectList({
  objects,
  selectedObjectId,
  onSelectObject,
  onDeleteObject,
  onReorderObject
}: ObjectListProps) {
  const getObjectDescription = (obj: CanvasObject): string => {
    switch (obj.type) {
      case 'rectangle':
        const rect = obj as RectangleObject;
        return `${rect.width}%×${rect.height}%${rect.cornerRadius ? ` (r:${rect.cornerRadius}%)` : ''}`;
      case 'circle':
        const circle = obj as CircleObject;
        return `radius: ${circle.radius}%`;
      case 'text':
        const text = obj as TextObject;
        return `"${text.text.substring(0, 20)}${text.text.length > 20 ? '...' : ''}" (${text.fontSize}%)`;
      case 'polygon':
        const polygon = obj as PolygonObject;
        return `${polygon.vertices.length} vertices`;
      default:
        return '';
    }
  };

  if (objects.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        <em>No objects yet. Use agent tools to add shapes!</em>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="text-xs text-gray-600 mb-2">
        Stack order: Bottom → Top (click to select)
      </div>
      <div className="space-y-2">
        {objects.map((obj, index) => (
          <div
            key={obj.id}
            className={`bg-white p-3 rounded border-2 cursor-pointer transition-all ${
              selectedObjectId === obj.id
                ? 'border-blue-500 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectObject(obj.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {index === objects.length - 1 && '🔝 '}
                  {index === 0 && '🔽 '}
                  {obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {getObjectDescription(obj)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Position: ({obj.x.toFixed(1)}%, {obj.y.toFixed(1)}%)
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderObject(obj.id, 'up');
                  }}
                  disabled={index === objects.length - 1}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderObject(obj.id, 'down');
                  }}
                  disabled={index === 0}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteObject(obj.id);
                  }}
                  className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 rounded"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}