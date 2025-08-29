'use client';

import { CreationMode, CanvasObject } from '@/app/drawit/types/drawit';
import { useState, useRef } from 'react';
import ConfirmDialog from './ui/ConfirmDialog';
import HorizontalToolbarLayout from './layouts/HorizontalToolbarLayout';
import VerticalToolbarLayout from './layouts/VerticalToolbarLayout';
import ToolbarContext from './ToolbarContext';

interface CanvasToolbarContainerProps {
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
  orientation?: 'horizontal' | 'vertical';
}

export default function CanvasToolbarContainer({
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
  onClearAll,
  orientation = 'horizontal'
}: CanvasToolbarContainerProps) {
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

  // Prepare all props for layout components
  const layoutProps = {
    // Canvas operations
    onSave,
    onLoad,
    onClearAll,
    handleSave,
    handleLoadClick,
    handleClearAll,
    handleFileChange,
    fileInputRef,
    // Creation tools
    currentMode,
    onModeChange,
    // Property editors
    selectedObject,
    currentStrokeColor,
    currentFillColor,
    currentStrokeWidth,
    shouldShowMakeDefaultButton: !!shouldShowMakeDefaultButton,
    openDropdown,
    strokeWidthOptions,
    handleStrokeColorChange,
    handleFillColorChange,
    handleStrokeWidthChange,
    onMakeSelectedObjectDefaults,
    setOpenDropdown,
    // Object manipulation
    handleCornerRadiusChange,
    onUpdateSelectedObject,
    onDeleteObject,
    onReorderObject,
    // Creation mode controls
    polygonVertexCount,
    onFinishPolygon,
    onCancelCreation
  };

  return (
    <div className="mb-4">
      <ToolbarContext.Provider value={layoutProps}>
        {orientation === 'vertical' ? (
          <VerticalToolbarLayout />
        ) : (
          <HorizontalToolbarLayout />
        )}
      </ToolbarContext.Provider>

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