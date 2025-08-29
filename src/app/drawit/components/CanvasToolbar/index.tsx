'use client';

import CanvasToolbarContainer from './CanvasToolbarContainer';
import { CreationMode, CanvasObject } from '@/app/drawit/types/drawit';

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
  orientation?: 'horizontal' | 'vertical';
}

export default function CanvasToolbar(props: CanvasToolbarProps) {
  return <CanvasToolbarContainer {...props} />;
}