import { CreationMode, CanvasObject } from '@/app/drawit/types/drawit';
import React from 'react';

export interface ToolbarLayoutProps {
  // Canvas operations
  onSave?: () => void;
  onLoad?: (file: File) => Promise<void>;
  onClearAll?: () => void;
  handleSave: () => void;
  handleLoadClick: () => void;
  handleClearAll: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;

  // Creation tools
  currentMode: CreationMode;
  onModeChange: (mode: CreationMode) => void;

  // Property editors
  selectedObject: CanvasObject | null;
  currentStrokeColor: string;
  currentFillColor: string;
  currentStrokeWidth: number;
  shouldShowMakeDefaultButton: boolean;
  openDropdown: string | null;
  strokeWidthOptions: number[];
  handleStrokeColorChange: (color: string) => void;
  handleFillColorChange: (color: string) => void;
  handleStrokeWidthChange: (width: number) => void;
  onMakeSelectedObjectDefaults?: () => void;
  setOpenDropdown: (dropdown: string | null | ((prev: string | null) => string | null)) => void;

  // Object manipulation
  handleCornerRadiusChange: (radius: number, closeDropdown?: boolean) => void;
  onUpdateSelectedObject?: (updates: Partial<CanvasObject>) => void;
  onDeleteObject?: (id: string) => void;
  onReorderObject?: (id: string, operation: 'up' | 'down' | 'top' | 'bottom') => void;

  // Creation mode controls
  polygonVertexCount: number;
  onFinishPolygon: () => void;
  onCancelCreation: () => void;
}