'use client';

import { CanvasObject, RectangleObject, CircleObject, TextObject, PolygonObject } from '@/app/drawit/types/drawit';
import { CONSTRAINTS } from '../lib/constants';

interface PropertiesPanelProps {
  selectedObject: CanvasObject | null;
  onUpdateObject: (id: string, updates: Partial<CanvasObject>) => void;
}

export default function PropertiesPanel({ selectedObject, onUpdateObject }: PropertiesPanelProps) {
  if (!selectedObject) {
    return null;
  }

  const handleChange = (field: string, value: string | number | undefined) => {
    onUpdateObject(selectedObject.id, { [field]: value });
  };

  const renderPositionProperties = () => (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">X Position</label>
        <input
          type="number"
          value={selectedObject.x.toFixed(1)}
          onChange={(e) => handleChange('x', parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          min={CONSTRAINTS.common.position.min}
          max={CONSTRAINTS.common.position.max}
          step="0.1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Y Position</label>
        <input
          type="number"
          value={selectedObject.y.toFixed(1)}
          onChange={(e) => handleChange('y', parseFloat(e.target.value) || 0)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          min={CONSTRAINTS.common.position.min}
          max={CONSTRAINTS.common.position.max}
          step="0.1"
        />
      </div>
    </div>
  );

  const renderVisualProperties = () => (
    <>
      {selectedObject.type !== 'text' && (() => {
        const obj = selectedObject as RectangleObject | CircleObject | PolygonObject;
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Fill Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={obj.fillColor || '#ffffff'}
                  onChange={(e) => handleChange('fillColor', e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={obj.fillColor || ''}
                  onChange={(e) => handleChange('fillColor', e.target.value || undefined)}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  placeholder="transparent"
                />
              </div>
            </div>
          </>
        );
      })()}

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Stroke Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={selectedObject.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedObject.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
            placeholder="#000000"
          />
        </div>
      </div>

      {selectedObject.type !== 'text' && (() => {
        const obj = selectedObject as RectangleObject | CircleObject | PolygonObject;
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stroke Width: {obj.strokeWidth || 2}px
              </label>
              <input
                type="range"
                value={obj.strokeWidth || 2}
                onChange={(e) => handleChange('strokeWidth', parseInt(e.target.value))}
                className="w-full"
                min={CONSTRAINTS.common.strokeWidth.min}
                max={CONSTRAINTS.common.strokeWidth.max}
              />
            </div>
          </>
        );
      })()}
    </>
  );

  const renderTransformProperties = () => (
    <>
      {selectedObject.rotation !== undefined && (
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Rotation: {(selectedObject.rotation || 0).toFixed(0)}°
          </label>
          <input
            type="range"
            value={selectedObject.rotation || 0}
            onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
            className="w-full"
            min={CONSTRAINTS.common.rotation.min}
            max={CONSTRAINTS.common.rotation.max}
          />
        </div>
      )}
    </>
  );


  const renderTypeSpecificProperties = () => {
    switch (selectedObject.type) {
      case 'rectangle': {
        const rect = selectedObject as RectangleObject;
        return (
          <>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Width (%)</label>
                <input
                  type="number"
                  value={rect.width.toFixed(1)}
                  onChange={(e) => handleChange('width', parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min={CONSTRAINTS.rectangle.width.min}
                  max={CONSTRAINTS.rectangle.width.max}
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Height (%)</label>
                <input
                  type="number"
                  value={rect.height.toFixed(1)}
                  onChange={(e) => handleChange('height', parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                  min={CONSTRAINTS.rectangle.width.min}
                  max={CONSTRAINTS.rectangle.width.max}
                  step="0.1"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Corner Radius: {(rect.cornerRadius || 0).toFixed(0)}%
              </label>
              <input
                type="range"
                value={rect.cornerRadius || 0}
                onChange={(e) => handleChange('cornerRadius', parseInt(e.target.value))}
                className="w-full"
                min={CONSTRAINTS.rectangle.cornerRadius.min}
                max={CONSTRAINTS.rectangle.cornerRadius.max}
              />
            </div>
          </>
        );
      }

      case 'circle': {
        const circle = selectedObject as CircleObject;
        return (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Radius (%)</label>
            <input
              type="number"
              value={circle.radius.toFixed(1)}
              onChange={(e) => handleChange('radius', parseFloat(e.target.value) || 1)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
              min={CONSTRAINTS.circle.radius.min}
              max={CONSTRAINTS.circle.radius.max}
              step="0.1"
            />
          </div>
        );
      }

      case 'text': {
        const text = selectedObject as TextObject;
        return (
          <>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Text Content</label>
              <textarea
                value={text.text}
                onChange={(e) => handleChange('text', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                rows={2}
              />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Font Size: {text.fontSize.toFixed(0)}%
              </label>
              <input
                type="range"
                value={text.fontSize}
                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                className="w-full"
                min={CONSTRAINTS.text.fontSize.min}
                max={CONSTRAINTS.text.fontSize.max}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                <select
                  value={text.fontFamily || 'Arial'}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Courier New">Courier</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Weight</label>
                <select
                  value={text.fontWeight || 'normal'}
                  onChange={(e) => handleChange('fontWeight', e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Light</option>
                </select>
              </div>
            </div>
          </>
        );
      }

      case 'polygon': {
        const polygon = selectedObject as PolygonObject;
        return (
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">Vertices</label>
            <div className="text-xs text-gray-600">
              {polygon.vertices.length} vertices (click on canvas to modify shape)
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">
        {selectedObject.type.charAt(0).toUpperCase() + selectedObject.type.slice(1)} Properties
      </h3>

      {/* Name field */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={selectedObject.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
          placeholder="Object name"
        />
      </div>

      {/* Type-specific properties (dimensions) */}
      {renderTypeSpecificProperties()}
      
      {/* Divider if there are type-specific properties */}
      {(selectedObject.type === 'rectangle' || selectedObject.type === 'circle' || selectedObject.type === 'text' || selectedObject.type === 'polygon') && (
        <div className="border-t border-gray-200 my-3"></div>
      )}
      
      {/* Position */}
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Position</div>
      {renderPositionProperties()}
      
      {/* Transform Properties */}
      {selectedObject.rotation !== undefined && (
        <>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Transform</div>
          {renderTransformProperties()}
        </>
      )}
      
      {/* Divider */}
      <div className="border-t border-gray-200 my-3"></div>
      
      {/* Visual Properties */}
      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Appearance</div>
      {renderVisualProperties()}
    </div>
  );
}