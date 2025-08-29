'use client';

import { RectangleObject, TextObject } from '@/app/drawit/types/drawit';
import ToolbarButton from '../ui/ToolbarButton';
import ToolbarDropdown from '../ui/ToolbarDropdown';
import CornerRadiusEditor from '@/components/editors/CornerRadiusEditor';
import TextEditor from '@/components/editors/TextEditor';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { CornerRadiusIcon } from '@/components/icons/CornerRadiusIcon';
import { TextEditIcon } from '@/components/icons/TextEditIcon';
import { useToolbarContext } from '../ToolbarContext';

export default function ObjectManipulationGroup() {
  const {
    selectedObject,
    openDropdown,
    setOpenDropdown,
    handleCornerRadiusChange,
    onUpdateSelectedObject,
    onDeleteObject,
    onReorderObject
  } = useToolbarContext();
  if (!selectedObject || !onDeleteObject || !onReorderObject) {
    return null;
  }

  return (
    <>
      {/* Rectangle-specific corner radius control */}
      {selectedObject.type === 'rectangle' && (
        <ToolbarDropdown
          trigger={<CornerRadiusIcon className="w-5 h-5" />}
          isOpen={openDropdown === 'cornerRadius'}
          onToggle={() => setOpenDropdown(prev => prev === 'cornerRadius' ? null : 'cornerRadius')}
          tooltip={`Corner Radius: ${(selectedObject as RectangleObject).cornerRadius || 0}%`}
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
    </>
  );
}