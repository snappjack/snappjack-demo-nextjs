'use client';

import ToolbarButton from '../ui/ToolbarButton';
import ToolbarColorPicker from '../ui/ToolbarColorPicker';
import ToolbarDropdown from '../ui/ToolbarDropdown';
import StrokeWidthSelector from '@/components/editors/StrokeWidthSelector';
import { PencilIcon } from '@heroicons/react/24/outline';
import { PaintBucketIcon } from '@/components/icons/PaintBucketIcon';
import { useToolbarContext } from '../ToolbarContext';

export default function PropertyEditorsGroup() {
  const {
    selectedObject,
    currentStrokeColor,
    currentFillColor,
    currentStrokeWidth,
    shouldShowMakeDefaultButton,
    openDropdown,
    strokeWidthOptions,
    handleStrokeColorChange,
    handleFillColorChange,
    handleStrokeWidthChange,
    onMakeSelectedObjectDefaults,
    setOpenDropdown
  } = useToolbarContext();
  return (
    <>
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
                className="bg-gray-800 dark:bg-gray-300 rounded-full"
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
          <div className="w-5 h-5 flex flex-col items-center justify-center text-[8px] font-medium leading-tight text-gray-700 dark:text-gray-300">
            <span>Make</span>
            <span>Default</span>
          </div>
        </ToolbarButton>
      )}
    </>
  );
}