'use client';

import { CreationMode, CanvasObject, RectangleObject, TextObject } from '@/app/drawit/types/drawit';
import { useState, useEffect, useRef } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
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
  const [showStrokeWidthDropdown, setShowStrokeWidthDropdown] = useState(false);
  const [showCornerRadiusDropdown, setShowCornerRadiusDropdown] = useState(false);
  const [showTextEditDropdown, setShowTextEditDropdown] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cornerRadiusDropdownRef = useRef<HTMLDivElement>(null);
  const textEditDropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowStrokeWidthDropdown(false);
      }
      if (cornerRadiusDropdownRef.current && !cornerRadiusDropdownRef.current.contains(event.target as Node)) {
        setShowCornerRadiusDropdown(false);
      }
      if (textEditDropdownRef.current && !textEditDropdownRef.current.contains(event.target as Node)) {
        setShowTextEditDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setShowStrokeWidthDropdown(false);
  };

  const handleCornerRadiusChange = (radius: number, closeDropdown: boolean = false) => {
    if (selectedObject && selectedObject.type === 'rectangle' && onUpdateSelectedObject) {
      onUpdateSelectedObject({ cornerRadius: radius });
    }
    if (closeDropdown) {
      setShowCornerRadiusDropdown(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Canvas Operations section */}
        {(onSave || onLoad || onClearAll) && (
          <div className="flex items-center gap-1">
            {onSave && (
              <div className="relative group">
                <button
                  onClick={handleSave}
                  className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
                  title="Save canvas"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Save
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
            
            {onLoad && (
              <div className="relative group">
                <button
                  onClick={handleLoadClick}
                  className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
                  title="Load canvas"
                >
                  <FolderOpenIcon className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Load
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
            
            {onClearAll && (
              <div className="relative group">
                <button
                  onClick={handleClearAll}
                  className="p-2 bg-white border border-gray-300 rounded hover:border-red-400 hover:bg-red-50 transition-colors flex items-center justify-center"
                  title="Clear all objects"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Clear All
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Creation tools section */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
          {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onModeChange(tool.id as CreationMode)}
            className={`
              relative group p-2 rounded transition-all duration-200 border
              ${currentMode === tool.id
                ? 'bg-blue-500 text-white shadow-md border-blue-500'
                : 'bg-white hover:bg-gray-100 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {tool.icon}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {tool.title}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </button>
          ))}
        </div>
        
        {/* Fill, Stroke, Stroke Width, and Make Default section */}
        <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
          {/* Fill Color */}
          {selectedObject?.type !== 'text' && (
            <div className="relative group">
              <button className="p-1.5 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex flex-col items-center justify-center">
                <div className="flex flex-col items-center w-6">
                  <PaintBucketIcon 
                    className="w-6 h-4" 
                  />
                  <div 
                    className="w-6 h-1.5 mt-0.5 rounded-sm border border-gray-300"
                    style={{ backgroundColor: currentFillColor || '#ffffff' }}
                  />
                </div>
                <input
                  type="color"
                  value={currentFillColor || '#ffffff'}
                  onChange={(e) => handleFillColorChange(e.target.value)}
                  className="opacity-0 absolute inset-0 cursor-pointer"
                  title="Fill Color"
                />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Fill Color
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
          
          {/* Stroke Color */}
          <div className="relative group">
            <button className="p-1.5 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex flex-col items-center justify-center">
              <div className="flex flex-col items-center w-6">
                <PencilIcon 
                  className="w-6 h-4" 
                />
                <div 
                  className="w-6 h-1.5 mt-0.5 rounded-sm border border-gray-300"
                  style={{ backgroundColor: currentStrokeColor }}
                />
              </div>
              <input
                type="color"
                value={currentStrokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer"
                title="Stroke Color"
              />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              Stroke Color
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
          
          {/* Stroke Width */}
          {selectedObject?.type !== 'text' && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowStrokeWidthDropdown(!showStrokeWidthDropdown)}
                className="p-1.5 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center group"
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <div 
                    className="bg-gray-800 rounded-full"
                    style={{
                      width: `${Math.min(currentStrokeWidth * 1.5, 20)}px`,
                      height: `${Math.min(currentStrokeWidth * 1.5, 20)}px`
                    }}
                  />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  Stroke Width: {currentStrokeWidth}px
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              </button>
              
              {/* Dropdown menu */}
              {showStrokeWidthDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50">
                  {strokeWidthOptions.map((width) => (
                    <button
                      key={width}
                      onClick={() => handleStrokeWidthChange(width)}
                      className={`
                        w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-100 transition-colors
                        ${currentStrokeWidth === width ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div 
                        className="bg-gray-800 rounded-full"
                        style={{
                          width: `${Math.min(width * 1.5, 20)}px`,
                          height: `${Math.min(width * 1.5, 20)}px`
                        }}
                      />
                      <span className="text-xs text-gray-600">{width}px</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Make Default Button */}
          {shouldShowMakeDefaultButton && onMakeSelectedObjectDefaults && (
            <div className="relative group">
              <button
                onClick={onMakeSelectedObjectDefaults}
                className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
                title="Make this object's properties the default for new objects"
              >
                <div className="w-5 h-5 flex flex-col items-center justify-center text-[8px] font-medium leading-tight text-gray-700">
                  <span>Make</span>
                  <span>Default</span>
                </div>
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Make this object&apos;s properties the default
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          )}
        </div>

        {/* Object Manipulation Tools section */}
        {selectedObject && onDeleteObject && onReorderObject && (
          <div className="flex items-center gap-1 border-l border-gray-300 pl-3">
            {/* Rectangle-specific corner radius control */}
            {selectedObject.type === 'rectangle' && (
              <div className="relative" ref={cornerRadiusDropdownRef}>
                <button
                  onClick={() => setShowCornerRadiusDropdown(!showCornerRadiusDropdown)}
                  className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center group"
                  title="Corner radius"
                >
                  <CornerRadiusIcon className="w-5 h-5" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Corner Radius: {(selectedObject as RectangleObject).cornerRadius || 0}%
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                
                {/* Dropdown menu */}
                {showCornerRadiusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-3 w-48">
                    {/* Current value display */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Corner Radius: {(selectedObject as RectangleObject).cornerRadius || 0}%
                      </label>
                      
                      {/* Slider */}
                      <input
                        type="range"
                        value={(selectedObject as RectangleObject).cornerRadius || 0}
                        onChange={(e) => handleCornerRadiusChange(parseInt(e.target.value))}
                        className="w-full mb-2"
                        min="0"
                        max="50"
                        step="1"
                      />
                      
                      {/* Input field */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="number"
                          value={(selectedObject as RectangleObject).cornerRadius || 0}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(50, parseInt(e.target.value) || 0));
                            handleCornerRadiusChange(value);
                          }}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          min="0"
                          max="50"
                        />
                        <span className="text-xs text-gray-600">%</span>
                      </div>
                    </div>
                    
                    {/* Preset buttons */}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="text-xs text-gray-500 mb-1">Quick presets:</div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0, 5, 10, 15, 30, 50].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleCornerRadiusChange(preset, true)}
                            className={`
                              px-1 py-1 text-xs rounded transition-colors
                              ${((selectedObject as RectangleObject).cornerRadius || 0) === preset 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }
                            `}
                          >
                            {preset}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text-specific editing control */}
            {selectedObject.type === 'text' && (
              <div className="relative" ref={textEditDropdownRef}>
                <button
                  onClick={() => setShowTextEditDropdown(!showTextEditDropdown)}
                  className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center group"
                  title="Edit text"
                >
                  <TextEditIcon className="w-5 h-5" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    Edit Text
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </button>
                
                {/* Text editing dropdown */}
                {showTextEditDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 p-3 w-64">
                    {/* Text Content */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Text Content</label>
                      <textarea
                        value={(selectedObject as TextObject).text}
                        onChange={(e) => {
                          if (onUpdateSelectedObject) {
                            onUpdateSelectedObject({ text: e.target.value });
                          }
                        }}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        rows={2}
                      />
                    </div>

                    {/* Font Size */}
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Font Size: {(selectedObject as TextObject).fontSize.toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        value={(selectedObject as TextObject).fontSize}
                        onChange={(e) => {
                          if (onUpdateSelectedObject) {
                            onUpdateSelectedObject({ fontSize: parseInt(e.target.value) });
                          }
                        }}
                        className="w-full mb-2"
                        min="1"
                        max="50"
                        step="1"
                      />
                    </div>

                    {/* Font Family and Weight */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                        <select
                          value={(selectedObject as TextObject).fontFamily || 'Arial'}
                          onChange={(e) => {
                            if (onUpdateSelectedObject) {
                              onUpdateSelectedObject({ fontFamily: e.target.value });
                            }
                          }}
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
                          value={(selectedObject as TextObject).fontWeight || 'normal'}
                          onChange={(e) => {
                            if (onUpdateSelectedObject) {
                              onUpdateSelectedObject({ fontWeight: e.target.value });
                            }
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Light</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative group">
              <button
                onClick={() => onReorderObject(selectedObject.id, 'up')}
                className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
                title="Move object up in layer order"
              >
                <ArrowUpIcon className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Move up
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            
            <div className="relative group">
              <button
                onClick={() => onReorderObject(selectedObject.id, 'down')}
                className="p-2 bg-white border border-gray-300 rounded hover:border-gray-400 transition-colors flex items-center justify-center"
                title="Move object down in layer order"
              >
                <ArrowDownIcon className="w-5 h-5" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Move down
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            
            <div className="relative group">
              <button
                onClick={() => onDeleteObject(selectedObject.id)}
                className="p-2 bg-white border border-gray-300 rounded hover:border-red-400 hover:bg-red-50 transition-colors flex items-center justify-center"
                title="Delete object"
              >
                <XMarkIcon className="w-5 h-5 text-red-600" />
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                Delete
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
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