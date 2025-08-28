'use client';

import { CreationMode, CanvasObject, RectangleObject, TextObject } from '@/app/drawit/types/drawit';
import { useState, useRef } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ToolbarButton from '@/components/ui/ToolbarButton';
import ToolbarColorPicker from '@/components/ui/ToolbarColorPicker';
import ToolbarDropdown from '@/components/ui/ToolbarDropdown';
import CornerRadiusEditor from '@/components/editors/CornerRadiusEditor';
import TextEditor from '@/components/editors/TextEditor';
import StrokeWidthSelector from '@/components/editors/StrokeWidthSelector';
import {
  CursorArrowRaysIcon,
  PencilIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  FolderOpenIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { RoundedSquareIcon } from '@/components/icons/RoundedSquareIcon';
import { TextBoxIcon } from '@/components/icons/TextBoxIcon';
import { PolygonIcon } from '@/components/icons/PolygonIcon';
import { PaintBucketIcon } from '@/components/icons/PaintBucketIcon';
import { CornerRadiusIcon } from '@/components/icons/CornerRadiusIcon';
import { TextEditIcon } from '@/components/icons/TextEditIcon';

interface CanvasToolbarProps {
  currentMode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  onFinishPolygon: () => void;
  onCancelCreation: () => void;
  polygonVertexCount: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  selectedObject: CanvasObject | null;
  onUpdateSelectedObject?: (updates: Partial<CanvasObject>) => void;
  onMakeSelectedObjectDefaults?: () => void;
  onDeleteObject?: (id: string) => void;
  onReorderObject?: (id: string, operation: 'up' | 'down' | 'top' | 'bottom') => void;
  onSave?: () => void;
  onLoad?: (file: File) => Promise<void>;
  onClearAll?: () => void;
}

export default function CanvasToolbar({
  currentMode,
  onModeChange,
  onFinishPolygon,
  onCancelCreation,
  polygonVertexCount,
  strokeColor,
  fillColor,
  strokeWidth,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange,
  selectedObject,
  onUpdateSelectedObject,
  onMakeSelectedObjectDefaults,
  onDeleteObject,
  onReorderObject,
  onSave,
  onLoad,
  onClearAll
}: CanvasToolbarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get current values - either from selected object or defaults
  const currentStrokeColor = selectedObject?.color || strokeColor;
  const currentFillColor = (selectedObject && 'fillColor' in selectedObject) 
    ? (selectedObject.fillColor || '#ffffff') 
    : fillColor;
  const currentStrokeWidth = (selectedObject && 'strokeWidth' in selectedObject) 
    ? (selectedObject.strokeWidth || 2) 
    : strokeWidth;

  // Check if selected object's properties differ from defaults
  const shouldShowMakeDefaultButton = selectedObject && (
    selectedObject.color !== strokeColor ||
    ('fillColor' in selectedObject && selectedObject.fillColor && selectedObject.fillColor !== fillColor) ||
    ('strokeWidth' in selectedObject && selectedObject.strokeWidth && selectedObject.strokeWidth !== strokeWidth)
  );

  const tools = [
    { 
      id: 'none', 
      icon: <CursorArrowRaysIcon className="w-5 h-5" />, 
      title: 'Select' 
    },
    { 
      id: 'rectangle', 
      icon: <RoundedSquareIcon className="w-5 h-5" />, 
      title: 'Rectangle' 
    },
    { 
      id: 'circle', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      ), 
      title: 'Circle' 
    },
    { 
      id: 'polygon', 
      icon: <PolygonIcon className="w-5 h-5" />, 
      title: 'Polygon' 
    },
    { 
      id: 'text', 
      icon: <TextBoxIcon className="w-5 h-5" />, 
      title: 'Text' 
    },
  ] as const;

  const strokeWidthOptions = [1, 2, 3, 5, 8, 12, 16];

  // Canvas operation handlers
  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onLoad) return;

    try {
      await onLoad(file);
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const confirmClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
    setShowClearConfirm(false);
  };


  const handleStrokeColorChange = (color: string) => {
    if (selectedObject && onUpdateSelectedObject) {
      onUpdateSelectedObject({ color });
    } else {
      onStrokeColorChange(color);
    }
  };

  const handleFillColorChange = (color: string) => {
    if (selectedObject && 'fillColor' in selectedObject && onUpdateSelectedObject) {
      onUpdateSelectedObject({ fillColor: color });
    } else {
      onFillColorChange(color);
    }
  };

  const handleStrokeWidthChange = (width: number) => {
    if (selectedObject && 'strokeWidth' in selectedObject && onUpdateSelectedObject) {
      onUpdateSelectedObject({ strokeWidth: width });
    } else {
      onStrokeWidthChange(width);
    }
    setOpenDropdown(null);
  };

  const handleCornerRadiusChange = (radius: number, closeDropdown: boolean = false) => {
    if (selectedObject && selectedObject.type === 'rectangle' && onUpdateSelectedObject) {
      onUpdateSelectedObject({ cornerRadius: radius });
    }
    if (closeDropdown) {
      setOpenDropdown(null);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Canvas Operations section */}
        {(onSave || onLoad || onClearAll) && (
          <div className="flex items-center gap-1">
            {onSave && (
              <ToolbarButton
                onClick={handleSave}
                tooltip="Save"
                title="Save canvas"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
              </ToolbarButton>
            )}
            
            {onLoad && (
              <ToolbarButton
                onClick={handleLoadClick}
                tooltip="Load"
                title="Load canvas"
              >
                <FolderOpenIcon className="w-5 h-5" />
              </ToolbarButton>
            )}
            
            {onClearAll && (
              <ToolbarButton
                onClick={handleClearAll}
                tooltip="Clear All"
                title="Clear all objects"
                variant="danger"
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </ToolbarButton>
            )}
          </div>
        )}

        {/* Creation tools section */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
          {tools.map((tool) => (
            <ToolbarButton
              key={tool.id}
              onClick={() => onModeChange(tool.id as CreationMode)}
              tooltip={tool.title}
              isActive={currentMode === tool.id}
            >
              {tool.icon}
            </ToolbarButton>
          ))}
        </div>
        
        {/* Fill, Stroke, Stroke Width, and Make Default section */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
          {/* Fill Color */}
          {selectedObject?.type !== 'text' && (
            <ToolbarColorPicker
              icon={<PaintBucketIcon className="w-6 h-4" />}
              value={currentFillColor || '#ffffff'}
              onChange={handleFillColorChange}
              tooltip="Fill Color"
              title="Fill Color"
            />
          )}
          
          {/* Stroke Color */}
          <ToolbarColorPicker
            icon={<PencilIcon className="w-6 h-4" />}
            value={currentStrokeColor}
            onChange={handleStrokeColorChange}
            tooltip="Stroke Color"
            title="Stroke Color"
          />
          
          {/* Stroke Width */}
          {selectedObject?.type !== 'text' && (
            <ToolbarDropdown
              trigger={
                <div className="w-6 h-6 flex items-center justify-center">
                  <div 
                    className="bg-gray-800 rounded-full"
                    style={{
                      width: `${Math.min(currentStrokeWidth * 1.5, 20)}px`,
                      height: `${Math.min(currentStrokeWidth * 1.5, 20)}px`
                    }}
                  />
                </div>
              }
              isOpen={openDropdown === 'strokeWidth'}
              onToggle={() => setOpenDropdown(prev => prev === 'strokeWidth' ? null : 'strokeWidth')}
              tooltip={`Stroke Width: ${currentStrokeWidth}px`}
            >
              <StrokeWidthSelector
                value={currentStrokeWidth}
                options={strokeWidthOptions}
                onChange={handleStrokeWidthChange}
              />
            </ToolbarDropdown>
          )}
          
          {/* Make Default Button */}
          {shouldShowMakeDefaultButton && onMakeSelectedObjectDefaults && (
            <ToolbarButton
              onClick={onMakeSelectedObjectDefaults}
              tooltip="Make this object's properties the default"
              title="Make this object's properties the default for new objects"
            >
              <div className="w-5 h-5 flex flex-col items-center justify-center text-[8px] font-medium leading-tight text-gray-700">
                <span>Make</span>
                <span>Default</span>
              </div>
            </ToolbarButton>
          )}
        </div>

        {/* Object Manipulation Tools section */}
        {selectedObject && onDeleteObject && onReorderObject && (
          <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
            {/* Rectangle-specific corner radius control */}
            {selectedObject.type === 'rectangle' && (
              <ToolbarDropdown
                trigger={<CornerRadiusIcon className="w-5 h-5" />}
                isOpen={openDropdown === 'cornerRadius'}
                onToggle={() => setOpenDropdown(prev => prev === 'cornerRadius' ? null : 'cornerRadius')}
                tooltip={`Corner Radius: ${(selectedObject as RectangleObject).cornerRadius || 0}%`}
                className="p-2"
              >
                <CornerRadiusEditor
                  value={(selectedObject as RectangleObject).cornerRadius || 0}
                  onChange={handleCornerRadiusChange}
                />
              </ToolbarDropdown>
            )}

            {/* Text-specific editing control */}
            {selectedObject.type === 'text' && (
              <ToolbarDropdown
                trigger={<TextEditIcon className="w-5 h-5" />}
                isOpen={openDropdown === 'textEdit'}
                onToggle={() => setOpenDropdown(prev => prev === 'textEdit' ? null : 'textEdit')}
                tooltip="Edit Text"
                className="p-2"
              >
                <TextEditor
                  textObject={selectedObject as TextObject}
                  onUpdate={(updates) => {
                    if (onUpdateSelectedObject) {
                      onUpdateSelectedObject(updates);
                    }
                  }}
                />
              </ToolbarDropdown>
            )}

            <ToolbarButton
              onClick={() => onReorderObject(selectedObject.id, 'up')}
              tooltip="Move up"
              title="Move object up in layer order"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => onReorderObject(selectedObject.id, 'down')}
              tooltip="Move down"
              title="Move object down in layer order"
            >
              <ArrowDownIcon className="w-5 h-5" />
            </ToolbarButton>
            
            <ToolbarButton
              onClick={() => onDeleteObject(selectedObject.id)}
              tooltip="Delete"
              title="Delete object"
              variant="danger"
            >
              <XMarkIcon className="w-5 h-5 text-red-600" />
            </ToolbarButton>
          </div>
        )}

        {/* Polygon completion controls */}
        {currentMode === 'polygon' && polygonVertexCount > 0 && (
          <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
            <span className="text-sm text-gray-600">
              {polygonVertexCount} vertices
            </span>
            <button
              onClick={onFinishPolygon}
              disabled={polygonVertexCount < 3}
              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Finish polygon (minimum 3 vertices required)"
            >
              Finish
            </button>
            <button
              onClick={onCancelCreation}
              className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              title="Cancel polygon creation"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Other creation mode feedback */}
        {currentMode !== 'none' && currentMode !== 'polygon' && (
          <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
            <span className="text-sm text-gray-600">
              {currentMode === 'text' ? 'Click to place text' : 'Click and drag to create'}
            </span>
            <button
              onClick={onCancelCreation}
              className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              title="Cancel creation"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input for load functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Confirm Dialog for Clear All */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Canvas"
        message="Are you sure you want to clear all objects? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600 text-white"
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}